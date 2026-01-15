import React from 'react';

const Batches = () => {
    // 2012 se start hoke current year tak batches generate karega
    const batches = [
        { year: "2012-2016", name: "The Pioneers", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2012" },
        { year: "2013-2017", name: "Trend Setters", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2013" },
        { year: "2014-2018", name: "Innovators", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2014" },
        { year: "2015-2019", name: "Achievers", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2015" },
        { year: "2016-2020", name: "Game Changers", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2016" },
        { year: "2017-2021", name: "Resilients", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2017" },
        { year: "2018-2022", name: "Visionaries", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2018" },
        { year: "2019-2023", name: "Challengers", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2019" },
        { year: "2020-2024", name: "Digital Batch", img: "https://placehold.co/400x300/004d00/FFF?text=Batch+2020" },
    ];

    return (
        <div className="content-entry-animation p-4">
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                    Our <span className="text-[#004d00]">Alumni Batches</span>
                </h1>
                <p className="text-gray-500 mt-2">Proud graduates serving the nation since 2012.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {batches.map((batch, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="h-40 bg-gray-200">
                            <img src={batch.img} alt={batch.year} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 text-center">
                            <h3 className="text-xl font-bold text-[#004d00]">{batch.year}</h3>
                            <p className="text-sm text-gray-500 font-medium">{batch.name}</p>
                            <button className="mt-3 text-xs bg-gray-100 hover:bg-[#FFD700] hover:text-[#004d00] px-3 py-1 rounded-full transition-colors">
                                View Students List
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Batches;