import Redis from 'ioredis';
import dotenv from "dotenv";
import IciciOrder from './models/IciciOrders.js'
dotenv.config();
const client = new Redis({
    password: process.env.redisPass,
    host: process.env.redisHost,
    port: process.env.redisPort,
});

export const consumeQueue = async () => {
    console.log("ORDERSAVING SERVICE STARTED");
    let running = true

    while (running) {
        try {
            await saveOrder();

        } catch (error) {
            console.log(error);
        }
    }
}

async function saveOrder() {
    const queueName = process.env.ICICI_ORDER_QUEUE
    let check = await client.exists(queueName)
    if (check) {
        const [queue, order] = await client.brpop(queueName, 0);
        const JsonOrder = JSON.parse(order);

        const existingObject = await IciciOrder.findOne({ orderReference: JsonOrder.orderReference });
        
        if (existingObject) {
            await IciciOrder.findByIdAndUpdate(existingObject._id, { $set: JsonOrder }, { new: true });
            // console.log("EXIST", res);
            
        } else {
            const newObject = new IciciOrder(JsonOrder);
            await newObject.save();
        }
    }
}