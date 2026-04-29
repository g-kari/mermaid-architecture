import { useCollaborationStore } from "../../stores/collaboration";

export default function OnlineUsers() {
  const { connected, onlineUsers } = useCollaborationStore();

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${connected ? "bg-success" : "bg-text-tertiary"}`} />
      <div className="flex -space-x-1">
        {onlineUsers.map((user) => (
          <div
            key={user.clientId}
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-bg-panel"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name[0]?.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}
