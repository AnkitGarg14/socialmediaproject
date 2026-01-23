import React from 'react';
import {useNavigate} from "react-router-dom";
import Message from '../../../server/models/Message';

const Notification=()=>{

const navigate=useNavigate();

return(
  <div className={'max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition'}>
    <div className='flex-1 p-4'>
      <div className='flex items-start'>
        <img src={Message.profile_picture} alt="" className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {Message.from_user_id.fullname}</p>
            <p className='text-sm text-gray-500'>
              {<M></M>essage.text.slice(0,50)}</p>
        </div>
      </div>
    </div>
  </div>
)
}