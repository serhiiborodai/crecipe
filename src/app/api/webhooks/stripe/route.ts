import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
    
    const { recipeId, userId } = session.metadata || {};

    if (recipeId && userId) {
      try {
        // Записываем покупку в Firestore
        await adminDb.collection('purchases').add({
          userId,
          recipeId,
          purchasedAt: new Date(),
          stripeSessionId: session.id,
          amount: session.amount_total,
          currency: session.currency,
        });

        console.log(`Покупка записана: user ${userId}, recipe ${recipeId}`);
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

