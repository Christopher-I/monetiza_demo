import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

const GoLiveModal = ({ isOpen, onClose, onSuccess }) => {
  const [viewer, setViewer] = useState('Only followers');
  const [topic, setTopic] = useState('');
  const [target, setTarget] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log({ viewer, topic, target });
    onSuccess({ viewer, topic, target })
    // onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="text-4xl text-orange-500 mb-4">📡</div>
        <h2 className="text-xl font-semibold mb-6">Start your Live</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Viewer Selection */}
          <div>
            <label className="block text-left text-gray-700 mb-2">
              Who can watch?
            </label>
            <select
              value={viewer}
              onChange={(e) => setViewer(e.target.value)}
              className="w-full p-3 border rounded-md"
            >
              <option value="Only followers">Only followers</option>
              <option value="Everyone">Everyone</option>
              <option value="Subscribers">Subscribers</option>
            </select>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-left text-gray-700 mb-2">
              What do you want to talk about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Type here..."
              className="w-full p-3 border rounded-md"
            />
          </div>

          {/* Incentive Target */}
          <div>
            <label className="block text-left text-gray-700 mb-2">
              Incentive Target?
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="$ Type here..."
              className="w-full p-3 border rounded-md"
            />
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-3 rounded-md hover:bg-orange-600"
          >
            Start Now
          </button>
        </form>
      </div>
    </ModalWrapper>
  );
};

export default GoLiveModal;