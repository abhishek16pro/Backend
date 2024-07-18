import Redis from "ioredis";
import axios from 'axios';
import dotenv from 'dotenv'
import sha256 from 'crypto-js/sha256.js';
dotenv.config();

const client = new Redis({
    password: process.env.redisPass,
    host: process.env.redisHost,
    port: process.env.redisPort,
});

let secretkey = process.env.secret_key_icici;
let appkey = process.env.appkey_icici;

async function generateHeaders(body) {
    try {
        let sessionToken = await client.get("ICICI_SESSION_TOKEN")
        let currentDate = new Date().toISOString().split(".")[0] + '.000Z';
        let checksum = sha256(currentDate + JSON.stringify(body) + secretkey);
        let headers = {
            "Content-Type": "application/json",
            'X-Checksum': "token " + checksum,
            'X-Timestamp': currentDate,
            'X-AppKey': appkey,
            'X-SessionToken': sessionToken,
        }
        return headers;
    } catch (error) {
        console.log("error==>", error);
    }
};

export const PlaceOrder = async (req, res) => {
    try {
        const orderBody = req.body
        console.log("orderBody==>", orderBody);

        let header = await generateHeaders(orderBody);

        let orderResponse = await axios.post(`${process.env.BASE_URL}order`, orderBody, { headers: header });
        console.log("Place order Res", orderResponse.data);

        if (orderResponse.data.Status === 200) {
            return res.status(200).json({
                order_id: orderResponse.data.Success.order_id,
                message: orderResponse.data.Success.message,
                stat: orderResponse.data.Status,
                Error: orderResponse.data.Error,
                Verified: true,
            });
        } else {
            return res.status(200).json({
                stat: orderResponse.data.Status,
                Error: orderResponse.data.Error,
                Verified: true,
            });
        }
    } catch (error) {
        console.log("Error in placeOrder", error);
        return res.status(500).json({
            stat: "OK",
            Error: error.response.data,
            Verified: true,
        });
    }
}

export const CheckOrderStatus = async (req, res) => {
    try {
        const orderBody = req.body
        if (!orderBody.order_id) {
            return res.status(400).json({
                stat: "OK",
                Error: "order_id is required",
                Verified: true,
                message: "order_id is required",
            });
        }

        const body = {
            "order_id": orderBody.order_id,
            "exchange_code": orderBody.exchange_code ? orderBody.exchange_code : "NSE",
        }

        let statusResponse = await OrderStatus(body);
        console.log("CheckOrderStatus ==>", statusResponse.data);

        if (statusResponse.data.Status === 200) {
            return res.status(200).json({
                stat: statusResponse.data.Status,
                Error: statusResponse.data.Error,
                Verified: true,
                message: statusResponse.data.Success,
            });
        } else {
            return res.status(200).json({
                stat: statusResponse.data.Status,
                Error: statusResponse.data.Error,
                Verified: true,
            });
        }

    } catch (error) {
        console.log("ERROR==>", error.response.data);
        return res.status(500).json({
            stat: "OK",
            Error: error.response.data,
            Verified: true,
        });
    }
}

export const CancleOrder = async (req, res) => {
    try {
        const orderBody = req.body
        if (!orderBody.order_id) {
            return res.status(400).json({
                stat: "OK",
                Error: "order_id is required",
                Verified: true,
                message: "order_id is required",
            });
        }

        const body = {
            "order_id": orderBody.order_id,
            "exchange_code": orderBody.exchange_code ? orderBody.exchange_code : "NSE",
        }
        console.log(body);

        let header = await generateHeaders(body);

        let statusResponse = await axios.delete(`${process.env.BASE_URL}order`,
            {
                headers: header,
                data: body
            }
        )
        console.log("CancleOrder==>", statusResponse.data);

        if (statusResponse.data.Status === 200) {
            return res.status(200).json({
                stat: statusResponse.data.Status,
                Error: statusResponse.data.Error,
                Verified: true,
                message: statusResponse.data.Success,
            });
        } else {
            return res.status(200).json({
                stat: statusResponse.data.Status,
                Error: statusResponse.data.Error,
                Verified: true,
            });
        }

    } catch (error) {
        console.log("ERROR==>", error.response.data);
        return res.status(500).json({
            stat: "OK",
            Error: error.response.data,
            Verified: true,
        });
    }
}

export const ModifyOrder = async (req, res) => {
    try {
        const orderBody = req.body
        if (!orderBody.order_id || !orderBody.exchange_code || !orderBody.quantity || !orderBody.price || !orderBody.order_type) {
            return res.status(400).json({
                stat: "OK",
                Error: "order_id, exchange_code, quantity, quantity, price, order_type is required",
                Verified: true,
                message: "order_id is required",
            });
        }

        const body = orderBody

        let header = await generateHeaders(body);

        let statusResponse = await axios.put(`${process.env.BASE_URL}order`,
            body,
            {
                headers: header,
            }
        )
        console.log("ModifyOrder==>", statusResponse.data);

        if (statusResponse.data.Status === 200) {
            return res.status(200).json({
                stat: statusResponse.data.Status,
                Error: statusResponse.data.Error,
                Verified: true,
                message: statusResponse.data.Success,
            });
        } else {
            return res.status(200).json({
                stat: statusResponse.data.Status,
                Error: statusResponse.data.Error,
                Verified: true,
            });
        }

    } catch (error) {
        console.log("ERROR==>", error.response.data);
        return res.status(500).json({
            stat: "OK",
            Error: error.response.data,
            Verified: true,
        });
    }
}

async function OrderStatus(body) {
    try {
        let header = await generateHeaders(body);

        let statusResponse = await axios.get(`${process.env.BASE_URL}order`,
            {
                headers: header,
                data: body
            }
        )
        return statusResponse
    } catch (error) {
        console.log("OrderStatus", error);
    }
}