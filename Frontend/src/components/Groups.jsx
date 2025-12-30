import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5263/api";

function Groups({ groups, selectedGroup, setSelectedGroup, fetchGroups, userId }) {
    const [newGroupName, setNewGroupName] = useState("");
    const [inviteUsernames, setInviteUsernames] = useState({});

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            await axios.post(`${API}/groups`, { name: newGroupName, ownerId: userId });
            setNewGroupName("");
            fetchGroups();
        } catch (err) {
            console.error("Błąd dodawania grupy:", err);
        }
    };
    const handleInviteChange = (groupId, value) => {
        setInviteUsernames(prev => ({ ...prev, [groupId]: value }));
    };
    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Usunąć grupę?")) return;
        try {
            await axios.delete(`${API}/groups/${groupId}`);
            fetchGroups();
        } catch (err) {
            console.error("Błąd usuwania grupy:", err);
        }
    };
    const handleAddUserToGroup = async (groupId) => {
        const username = inviteUsernames[groupId]?.trim();
        if (!username) return;

        try {
            await axios.post(`${API}/groups/${groupId}/users`, { username });
            setInviteUsernames(prev => ({ ...prev, [groupId]: "" }));
            alert("Użytkownik dodany do grupy");
        } catch (err) {
            console.error(err);
            alert("Nie udało się dodać użytkownika");
        }
    };

    return (
        <div>
            <h2>Grupy</h2>
            <ul>
                {groups.map(group => (
                    <li key={group.id}>
                        <button
                            onClick={() => setSelectedGroup(group)}
                            style={{ fontWeight: selectedGroup?.id === group.id ? "bold" : "normal", marginTop: 15 }}
                        >
                            {group.name}
                        </button>
                        <button
                            onClick={() => handleDeleteGroup(group.id)}
                            style={{ marginLeft: 8, color: "red" }}
                        >
                            X
                        </button>
                        {selectedGroup?.id === group.id && (
                            <div style={{ marginTop: 15, marginBottom: 20 }}>
                                <input
                                    placeholder="Username do dodania"
                                    value={inviteUsernames[group.id] || ""}
                                    onChange={e => handleInviteChange(group.id, e.target.value)}
                                />
                                <button onClick={() => handleAddUserToGroup(group.id)} style={{marginTop: 10 }}>
                                    Dodaj użytkownika
                                </button>
                            </div>
                        )}


                    </li>
                ))}
            </ul>
            <input
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Nowa grupa"
            />
            <button onClick={handleAddGroup}  style={{marginLeft: 10 }}>Dodaj</button>
        </div>

    );
}

export default Groups;
