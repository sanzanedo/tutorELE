import React from 'react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onClick: (topic: Topic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
  return (
    <button
      onClick={() => onClick(topic)}
      className="group flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-indigo-500 transition-all duration-300 text-left w-full h-full"
    >
      <div className="p-3 mb-4 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-2xl">
        {topic.icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{topic.title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{topic.description}</p>
    </button>
  );
};
