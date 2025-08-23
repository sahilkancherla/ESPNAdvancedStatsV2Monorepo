const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getLeaguesForUser(userId: string) {
    const res = await fetch(`${API_URL}/league/getAllLeaguesForUser?userId=${userId}`, {
      cache: "no-store",
    });
    return res.json();
}