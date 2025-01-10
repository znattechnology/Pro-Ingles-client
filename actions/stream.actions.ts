"use server";

import { useSelector } from "react-redux";
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const apiSecret = process.env.STREAM_SECRET_KEY;



export const tokenProvider = async () => {


    // const { user, } = useSelector((state: any) => state.auth);

    const user = '66080423d6a097ede892aaf7';


    if (!user) throw new Error('user not specified');
    if (!apiKey) throw new Error('apiKey not specified');
    if (!apiSecret) throw new Error('apiSecret not specified');

    const streamClient = new StreamClient(apiKey, apiSecret);

  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const issuedAt = Math.floor(Date.now() / 1000) - 60;

  const token = streamClient.createToken(user, expirationTime, issuedAt);

  return token;


}



