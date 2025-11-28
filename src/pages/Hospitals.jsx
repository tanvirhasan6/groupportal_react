import React from 'react'

export default function Hospitals() {
    return (
        <div className='flex flex-col gap-2 items-center p-2'>

            <h1>All Hospitals</h1>

            <div className='w-full'>
                <iframe
                    src="https://zenithlifebd.com/hospitallist/"
                    title="Hospital List"
                    style={{
                        width: "100%",
                        height: "75vh",
                        border: "none",
                    }}
                />
            </div>

        </div>
    )
}
