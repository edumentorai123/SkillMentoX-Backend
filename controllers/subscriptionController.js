

import User from "../models/User.js";
import stripe from "../utils/stripe.js";

export const createCheckoutSession = async (req, res) => {
    try {
        const { priceId } = req.body;
        const userId = req.user.id;

        if (!priceId) {
            return res.status(400).json({ message: "Price ID is required" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Create Stripe customer if not exists
        if (!user.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.firstName} ${user.lastName || ""}`,
                metadata: { userId: user._id.toString() },
            });
            user.stripeCustomerId = customer.id;
            await user.save();
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            customer: user.stripeCustomerId,
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
        });

        return res.json({ url: session.url });

    } catch (err) {
        console.error("Stripe Checkout Error:", err);

        if (err.raw) {
            return res.status(err.statusCode || 500).json({
                message: err.raw.message,
                type: err.raw.type,
                code: err.raw.code,
            });
        }

        return res.status(500).json({ message: "Failed to create checkout session", error: err.message });
    }
};


export const stripeWebhook = async (req, res) => {
    let event;

    try {
        const sig = req.headers["stripe-signature"];
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const customerId = session.customer;
                const subscriptionId = session.subscription;

                const user = await User.findOne({ stripeCustomerId: customerId });
                if (user) {
                    user.isPremium = true;
                    user.subscriptionId = subscriptionId;
                    user.subscriptionStatus = "active";
                    await user.save();
                }
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                const user = await User.findOne({
                    subscriptionId: subscription.id,
                });
                if (user) {
                    user.isPremium = false;
                    user.subscriptionStatus = "canceled";
                    await user.save();
                }
                break;
            }
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Webhook handler failed:", err);
        res.status(500).send("Webhook handler error");
    }
};

export const verifySession = async (req, res) => {
    try {
        const { session_id } = req.query;

        if (!session_id) {
            return res.status(400).json({ success: false, message: "Missing session_id" });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            const customerId = session.customer;
            const subscriptionId = session.subscription;

            const user = await User.findOne({ stripeCustomerId: customerId });
            if (user) {
                user.isPremium = true;
                user.subscriptionId = subscriptionId;
                user.subscriptionStatus = "active";
                await user.save();
            }

            return res.json({ success: true, session });
        } else {
            return res.json({ success: false, message: "Payment not completed" });
        }
    } catch (err) {
        console.error("Error verifying session:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

