export interface Player {
    id: string;
    name: string;
}

export interface Room {
    code: string;
    players: Player[];
}

const rooms: Record<string, Room> = {};

export function createRoom(code: string, player: Player): Room {
    const room: Room = {
        code,
        players: [player],
    };
    rooms[code] = room;
    return room;
}

export function joinRoom(code: string, player: Player): Room | null {
    const room = rooms[code];
    if (!room) return null;
    if (room.players.length >= 2) return null;
    room.players.push(player);
    return room;
}

export function getRoom(code: string): Room | null {
    return rooms[code] || null;
}

export function removePlayerFromRoom(code: string, playerId: string): void {
    const room = rooms[code];
    if (!room) return;
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.players.length === 0) {
        delete rooms[code];
    }
}