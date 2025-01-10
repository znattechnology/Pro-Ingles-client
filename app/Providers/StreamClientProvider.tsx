
'use client';
import {
    StreamVideo,
    StreamVideoClient,

  } from '@stream-io/video-react-sdk';

import { ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Loader from '@/components/Loader';
// import { useGetStreamVideoTokenQuery } from '../../../redux/features/courses/coursesApi';
import { tokenProvider } from '@/../../actions/stream.actions';




    
  
    export const StreamVideoProvider = ({children}: {children:ReactNode}) => {

        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
        const { user } = useSelector((state: any) => state.auth);

    const [videoClient , setVideoClient ] = useState<StreamVideoClient>();
    // const { data:tokenProvider} = useGetStreamVideoTokenQuery({});


    useEffect(() => {

        if(!user) return;
        if(!apiKey) throw new Error('Stream API key not available');

        const client = new StreamVideoClient({
            apiKey,
            user:{
                id: user?._id,
                name: user?.name || user?._id,
                image:user?.avatar
            },

            tokenProvider: tokenProvider
        })

        setVideoClient(client)



  },[user, apiKey]);

   if(!videoClient) return <Loader/>;
    return (
      <StreamVideo client={videoClient}>
            {children}
      </StreamVideo>
    );
  };