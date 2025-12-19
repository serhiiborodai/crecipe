import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const { recipeId, recipeTitle, recipeDescription, price, userId, userEmail } = await request.json();

    if (!recipeId || !userId || !price) {
      return NextResponse.json(
        { error: 'Не указаны необходимые данные' },
        { status: 400 }
      );
    }

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
              name: recipeTitle || 'Рецепт',
              description: recipeDescription || undefined,
            },
            unit_amount: price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        recipeId,
        userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recipes/${recipeId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recipes/${recipeId}?canceled=true`,
    });

    // Возвращаем URL для редиректа (новый метод)
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Ошибка создания checkout сессии:', error);
    return NextResponse.json(
      { error: 'Ошибка создания сессии оплаты' },
      { status: 500 }
    );
  }
}
