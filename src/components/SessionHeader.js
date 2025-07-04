export default function SessionHeader({ session }) {
  const { conversation_id, history, valid_history_range, tools } = session;
  
  const totalMessages = history.reduce((total, exchange) => total + exchange.length, 0);
  const totalExchanges = history.length;
  const availableTools = tools?.native___?.length || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Q Chat Session
          </h1>
          <p className="text-sm text-gray-600 font-mono">
            ID: {conversation_id}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active Session
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalExchanges}</div>
          <div className="text-sm text-blue-800">Exchanges</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{totalMessages}</div>
          <div className="text-sm text-green-800">Total Messages</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{availableTools}</div>
          <div className="text-sm text-purple-800">Available Tools</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {valid_history_range ? `${valid_history_range[0]}-${valid_history_range[1]}` : 'N/A'}
          </div>
          <div className="text-sm text-orange-800">Valid Range</div>
        </div>
      </div>

      {session.latest_summary && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Latest Summary</h3>
          <p className="text-sm text-gray-700">{session.latest_summary}</p>
        </div>
      )}
    </div>
  );
}
