import React from 'react';

interface NodeData {
  id: string;
  name: string;
  type: string;
  count: number;
  group: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface LinkData {
  source: string | NodeData;
  target: string | NodeData;
  predicates: string[];
  descriptions: string[];
  values: string[];
  count: number;
}

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkData: LinkData | null;
}

const LinkModal = ({ isOpen, onClose, linkData }: LinkModalProps) => {
  if (!isOpen || !linkData) return null;

  const getNodeName = (node: string | NodeData): string => {
    if (typeof node === 'string') return node;
    return node.name || 'Unknown';
  };

  const sourceName = getNodeName(linkData.source);
  const targetName = getNodeName(linkData.target);

  return (
    <>
      <style jsx>{`
        .modal {
          display: ${isOpen ? 'block' : 'none'};
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background-color: #1a1a1a;
          border: 1px solid #2a2a2a;
          margin: 5% auto;
          padding: 25px;
          border-radius: 12px;
          width: 80%;
          max-width: 700px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          color: #ffffff;
        }

        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #0a0a0a;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }

        .close {
          color: #888;
          float: right;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .close:hover,
        .close:focus {
          color: #ffffff;
          text-decoration: none;
        }

        .modal-content h3 {
          margin-bottom: 20px;
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          border-bottom: 1px solid #2a2a2a;
          padding-bottom: 10px;
        }

        .modal-content > p {
          color: #cccccc;
          margin-bottom: 15px;
          font-size: 14px;
        }

        .relations-list {
          margin-top: 20px;
          max-height: 50vh;
          overflow-y: auto;
        }

        .relation-item {
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 15px;
          background-color: #111111;
          transition: border-color 0.2s ease;
        }

        .relation-item:hover {
          border-color: #6366f1;
        }

        .relation-item h4 {
          margin: 0 0 12px 0;
          color: #6366f1;
          font-size: 16px;
          font-weight: 600;
        }

        .relation-item p {
          margin: 8px 0;
          line-height: 1.6;
          color: #cccccc;
          font-size: 14px;
        }

        .relation-item p strong {
          color: #ffffff;
          font-weight: 500;
        }
      `}</style>

      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>
            &times;
          </span>
          
          <div id="modal-relations">
            <h3>
              Relations between {sourceName} and {targetName}
            </h3>
            
            <p>
              <strong>Total Relations:</strong> {linkData.count}
            </p>
            
            <div className="relations-list">
              {linkData.predicates.map((predicate, index) => (
                <div key={index} className="relation-item">
                  <h4>{predicate}</h4>
                  
                  <p>
                    <strong>Description:</strong> {linkData.descriptions[index] || 'No description available'}
                  </p>
                  
                  <p>
                    <strong>Formula:</strong> {linkData.values[index] || 'No formula available'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LinkModal;