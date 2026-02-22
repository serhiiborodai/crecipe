import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Инициализация Firebase Admin
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );
  
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Отсутствует подпись' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Ошибка верификации webhook:', error);
    return NextResponse.json(
      { error: 'Неверная подпись webhook' },
      { status: 400 }
    );
  }

  // Обработка успешной оплаты
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const { 
      recipeId, 
      purchasedByUserId,
      purchasedByEmail,
      isGift,
      recipientEmail,
      isSelfGift,
    } = session.metadata || {};

    if (recipeId && recipientEmail) {
      try {
        // Пытаемся найти userId получателя по email
        let recipientUserId: string | null = null;
        try {
          const userRecord = await adminAuth.getUserByEmail(recipientEmail);
          recipientUserId = userRecord.uid;
        } catch {
          // Пользователь не найден — это нормально для подарков новым пользователям
          console.log(`Пользователь ${recipientEmail} ещё не зарегистрирован`);
        }

        // Записываем покупку в Firestore
        await adminDb.collection('purchases').add({
          recipientEmail,
          recipientUserId,
          recipeId,
          purchasedByUserId: purchasedByUserId || null,
          purchasedByEmail: purchasedByEmail || null,
          isGift: isGift === 'true',
          isSelfGift: isSelfGift === 'true',
          purchasedAt: new Date(),
          stripeSessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
        });

        console.log(`Покупка записана: recipient ${recipientEmail}, recipe ${recipeId}, isGift: ${isGift}`);
      } catch (error) {
        console.error('Ошибка записи покупки:', error);
        return NextResponse.json(
          { error: 'Ошибка записи покупки' },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}

