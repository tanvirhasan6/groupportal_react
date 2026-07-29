import React from 'react'

export default function Hospitals() {
    return (
        <div className='flex flex-col gap-2 items-center'>

            <h1>All Hospitals</h1>

            <div className="w-full overflow-x-auto">
                <iframe
                    src="https://zenithlifebd.com/hospitallist/"
                    title="Hospital List"
                    className="w-full border-none min-w-[415px] md:min-w-0"
                    style={{
                        height: "75vh"
                    }}
                />
            </div>

        </div>
    )
}
