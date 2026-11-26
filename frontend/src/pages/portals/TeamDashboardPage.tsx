import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { Code2, CheckSquare, ArrowRight, FolderGit2, Clock, Loader2 } from 'lucide-react';
import { DragonEmblem } from '../../components/ui/DragonLogo';
import { isOrderCompletedAndPaid } from '../../utils/orderGovernance';

export const TeamDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<{ success: boolean; orders: any[] }>('/orders')
      .then((res) => setOrders(res.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, []);

  const activeOrders = orders.filter((o) => o.status !== 'cancelled' && !isOrderCompletedAndPaid(o));
  const assignedToMe = orders.filter(
    (o) => o.assignedEmployeeId?._id === user?.id || o.assignedEmployeeId === user?.id
  );
  const completedOrders = orders.filter(isOrderCompletedAndPaid);

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 bg-[#050609]">
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#11151D] via-[#161B26] to-[#11151D] border border-[#D6A94F]/40 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D6A94F]/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050609] border border-[#D6A94F]/40 text-xs font-mono text-[#FFBD55]">
            <Code2 className="w-4 h-4 text-[#FFBD55]" />
            <span>ENGINEERING SPRINT COMMAND</span>
          </div>
          <DragonEmblem size={36} glow={true} variant="gold" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-vanguard font-bold text-white relative z-10">
          Internal Engineering Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed relative z-10">
          Welcome, {user?.fullName}. Review live client orders, manage assigned technical sprints, and update project deliverables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
          <div className="text-xs font-mono text-[#FFBD55] uppercase">Active Client Orders</div>
          <div className="text-3xl font-cyber font-bold text-white">{activeOrders.length}</div>
          <div className="text-xs text-[#9299A6]">Open in engineering queue</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
          <div className="text-xs font-mono text-[#78BFFF] uppercase">Assigned To You</div>
          <div className="text-3xl font-cyber font-bold text-white">{assignedToMe.length}</div>
          <div className="text-xs text-[#9299A6]">Your claimed project deliverables</div>
        </div>

        <div className="p-6 rounded-2xl bg-[#11151D] border border-[#292E38] space-y-2">
          <div className="text-xs font-mono text-emerald-400 uppercase">Completed Releases</div>
          <div className="text-3xl font-cyber font-bold text-emerald-400">{completedOrders.length}</div>
          <div className="text-xs text-[#9299A6]">Delivered &amp; signed off</div>
        </div>
      </div>

      <div className="p-8 rounded-3xl bg-[#11151D] border border-[#292E38] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#292E38]">
          <h3 className="text-lg font-display font-bold text-white">Live Client Orders Queue</h3>
          <Link
            to="/workspace/orders"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FFBD55] hover:text-white transition-colors"
          >
            <span>Open Full Orders Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs font-mono text-[#9299A6]">
            <Loader2 className="w-4 h-4 animate-spin text-[#FFBD55]" />
            <span>Loading live orders from database...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center space-y-2 text-xs text-[#9299A6]">
            <FolderGit2 className="w-8 h-8 text-[#9299A6] opacity-40 mx-auto" />
            <div className="text-white font-semibold">No Active Orders in Queue</div>
            <p>New client project orders will appear here automatically as clients submit them.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 8).map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-xl bg-[#0A0D13] border border-[#292E38] flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-[#FFBD55] shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white">{order.projectTitle}</div>
                    <div className="text-[11px] font-mono text-[#9299A6]">
                      #{order.orderNumber} • {order.clientId?.fullName || 'Client'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#11151D] border border-[#292E38] text-slate-300 uppercase">
                    {order.priority || 'normal'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                      order.status === 'completed'
                        ? 'bg-emerald-950/70 text-emerald-400'
                        : 'bg-[#D6A94F]/10 text-[#FFBD55]'
                    }`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <Clock className="w-3.5 h-3.5 text-[#9299A6]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
