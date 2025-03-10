import React, { useState } from 'react';

interface TabProps {
    content: string;
}

const Tab: React.FC<TabProps> = ({ content }) => {
    return (
        <div className="py-2 bg-white">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

interface TabsProps {
    tabs: { label: string; content: string }[];
}

const CustomTabs: React.FC<TabsProps> = ({ tabs }) => {
    const [activeTab, setActiveTab] = useState<number>(0);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex border-b">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        className={`py-2 px-4 cursor-pointer uppercase focus-visible:outline-hidden text-md font-medium text-gray-900 hover:text-primary ${activeTab === index ? 'text-primary border-b-2 border-primary' : ''
                            }`}
                        onClick={() => setActiveTab(index)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {tabs[activeTab] && <Tab content={tabs[activeTab].content} />}
            </div>
        </div>
    );
};

export default CustomTabs;
