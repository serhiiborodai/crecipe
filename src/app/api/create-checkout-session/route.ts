import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { 
      recipeId, 
      recipeTitle, 
      recipeDescription, 
      price, 
      userId, 
      userEmail,
      isGift,
      recipientEmail,
      isSelfGift,
    } = await request.json();

    if (!recipeId || !userId || !price) {
      return NextResponse.json(
        { error: 'Не указаны необходимые данные' },
        { status: 400 }
      );
    }

    // Для подарка требуется email получателя
    if (isGift && !recipientEmail) {
      return NextResponse.json(
        { error: 'Не указан email получателя' },
        { status: 400 }
      );
    }

    // Определяем URL возврата
    const successUrl = isGift 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/?gift=success`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/recipes/${recipeId}?success=true`;
    
    const cancelUrl = isGift
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/?gift=canceled`
      : `${process.env.NEXT_PUBLIC_BASE_URL}/recipes/${recipeId}?canceled=true`;

    // Создаём Stripe Checkout сессию
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isGift ? `🎁 ${recipeTitle}` : recipeTitle || 'Рецепт',
              description: isGift 
                ? `Подарок для ${recipientEmail}`
                : recipeDescription || undefined,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        recipeId,
        purchasedByUserId: userId,
        purchasedByEmail: userEmail,
        isGift: isGift ? 'true' : 'false',
        recipientEmail: isGift ? recipientEmail : userEmail,
        isSelfGift: isSelfGift ? 'true' : 'false',
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Ошибка создания checkout сессии:', error);
    return NextResponse.json(
      { error: 'Ошибка создания сессии оплаты' },
      { status: 500 }
    );
  }
}
