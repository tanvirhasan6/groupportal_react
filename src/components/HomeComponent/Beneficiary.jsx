import React from 'react'
import { FiPhoneCall } from "react-icons/fi"
import { IoMailOutline  } from 'react-icons/io5'


export default function Beneficiary() {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-lg">
            <h3 className='font-bold text-left mb-2'>Contact for Help</h3>
            <div className='pl-2'>
                <p className='flex items-center gap-2'>Md Nadim Hasan (Officer), <FiPhoneCall/> 01613341659</p>
                <p className='flex items-center gap-2'><IoMailOutline /> info@zenithlifebd.com</p>
                <p className='text-xs mt-2'>Sunday - Thursday (except holidays) from 10:00 AM to 5:00 PM</p>
            </div>
        </div>
    )
}
