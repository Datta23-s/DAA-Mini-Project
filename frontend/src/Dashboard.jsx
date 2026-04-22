import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import { 
  LayoutDashboard, Compass, Share2, Settings, HelpCircle, 
  LogOut, Bell, User as UserIcon, Search, Sliders 
} from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';

// --- Sub-Components ---
const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-blue-500/10 text-blue-400'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const UserCard = ({ user, actionLabel, onAction, actionIcon }) => {
  const ActionIcon = actionIcon || Share2;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col items-center gap-3 hover:shadow-lg transition-shadow">
      <img
        src={user.avatar || `https://i.pravatar.cc/150?u=${user.email || user._id}`}
        alt={user.name}
        className="w-16 h-16 rounded-xl border-2 border-gray-200"
      />
      <div className="text-center">
        <p className="font-semibold text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-400">{user.networkLevel || 'Explorer'}</p>
      </div>
      {user.interests && user.interests.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1">
          {user.interests.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
              {tag}
            </span>
          ))}
        </div>
      )}
      {user.matchScore && (
        <div className="text-xs font-bold text-green-600">{Math.round(user.matchScore)}% Match</div>
      )}
      <button
        onClick={() => onAction(user)}
        className="w-full mt-1 bg-[#2d5a4c] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#3a7363] transition-colors flex items-center justify-center gap-2"
      >
        <ActionIcon size={14} />
        {actionLabel}
      </button>
    </div>
  );
};

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [exploreUsers, setExploreUsers] = useState([]);
  const [myFriends, setMyFriends] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const [recs, explore, friends] = await Promise.all([
        api.get(`/recommendations/${userId}`).catch(() => ({ data: [] })),
        api.get(`/users/explore`).catch(() => ({ data: [] })),
        api.get(`/users/friends`).catch(() => ({ data: [] }))
      ]);

      setRecommendations(recs?.data || []);
      setExploreUsers(explore?.data || []);
      setMyFriends(friends?.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleConnect = async (targetUser) => {
    try {
      await api.post(`/users/connect/${targetUser._id}`);
      setNotification(`Successfully connected with ${targetUser.name}!`);
      fetchData(); // Refresh data and Dijkstra graph
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification('Failed to connect. Try again.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredRecs = recommendations.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex bg-[#f0f4f9] min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#232a35] text-gray-300 flex flex-col h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Connect<span className="text-blue-400">IQ</span>
          </h1>
        </div>

        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
            <img src={user?.avatar || `https://i.pravatar.cc/150?u=${user?.email}`} alt="Profile" className="w-10 h-10 rounded-lg border-2 border-green-500" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Network Level: {user?.networkLevel || 'Elite'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<Compass size={20} />} label="Explore" active={activeTab === 'Explore'} onClick={() => setActiveTab('Explore')} />
          <NavItem icon={<Share2 size={20} />} label="My Network" active={activeTab === 'My Network'} onClick={() => setActiveTab('My Network')} />
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-1">
          <NavItem icon={<HelpCircle size={20} />} label="Help" />
          <NavItem icon={<LogOut size={20} />} label="Logout" onClick={handleLogout} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {notification && (
          <div className="absolute top-20 right-8 bg-black text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2">
            <Share2 size={18} className="text-green-400" />
            <span className="text-sm font-medium">{notification}</span>
          </div>
        )}

        {/* Header */}
        <header className="h-16 bg-[#232a35] border-b border-gray-700 flex items-center justify-between px-8 text-white z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full bg-[#303945] border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-6">
            <Bell size={20} className="text-gray-400 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center">
              <UserIcon size={18} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'Dashboard' && (
            <>
              {/* Topology Column */}
              <div className="flex-1 p-8 flex flex-col overflow-hidden relative">
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Neural Topology</h2>
                    <p className="text-gray-500 text-sm">Interactive visualization of your Dijkstra social path.</p>
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase ring-1 ring-green-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Nodes Active
                  </div>
                </div>

                <div className="flex-1 bg-white rounded-[32px] border border-gray-200 neural-grid overflow-hidden">
                  <ForceGraph2D
                    graphData={{
                      nodes: [
                        { id: user?.id || user?._id, name: user?.name || 'Me', color: '#2d5a4c' },
                        ...(myFriends || []).map(f => ({ id: f._id || f.id, name: f.name, color: '#bdc3c7' }))
                      ],
                      links: (myFriends || []).map(f => ({ source: user?.id || user?._id, target: f._id || f.id }))
                    }}
                    nodeCanvasObject={(node, ctx) => {
                      const size = 10;
                      ctx.beginPath();
                      ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
                      ctx.fillStyle = node.color;
                      ctx.fill();
                      ctx.strokeStyle = '#fff';
                      ctx.lineWidth = 2;
                      ctx.stroke();
                      
                      const label = (node.name || '').split(' ').map(n=>n[0]).join('');
                      ctx.font = '6px Inter';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillStyle = '#fff';
                      ctx.fillText(label, node.x, node.y);
                    }}
                    linkColor={() => '#ecf0f1'}
                    width={800} height={600}
                  />
                </div>
              </div>
              <div className="w-96 p-8 border-l border-gray-200 bg-white/50 overflow-y-auto no-scrollbar">
                <h3 className="text-xl font-bold mb-6">Algorithm Picks</h3>
                <div className="space-y-4">
                  {filteredRecs.map((u, i) => <UserCard key={i} user={u} actionLabel="Connect" onAction={handleConnect} />)}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Explore' && (
            <div className="flex-1 p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold mb-8">Explore the Network</h2>
              <div className="grid grid-cols-3 gap-6">
                {exploreUsers.map((u, i) => <UserCard key={i} user={u} actionLabel="Connect" onAction={handleConnect} />)}
              </div>
            </div>
          )}

          {activeTab === 'My Network' && (
            <div className="flex-1 p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold mb-8">My Connections</h2>
              <div className="grid grid-cols-3 gap-6">
                {myFriends.map((u, i) => <UserCard key={i} user={u} actionLabel="View Profile" onAction={()=>{}} actionIcon={UserIcon} />)}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
