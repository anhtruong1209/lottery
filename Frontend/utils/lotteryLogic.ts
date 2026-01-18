import { Participant, Winner } from '../types';

/**
 * Shuffles an array using the Fisher-Yates algorithm for high randomness quality.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Selects winners from the pool.
 * Constraint: A person (ID) cannot win twice.
 */
export const selectWinners = (
  allParticipants: Participant[],
  currentWinners: Winner[],
  count: number
): Participant[] => {
  // 1. Filter out anyone who has already won (Strict: One ID, one Gift)
  const winnerIds = new Set(currentWinners.map(w => w.id));

  const eligibleCandidates = allParticipants.filter(p => {
    // Check if person already won
    if (winnerIds.has(p.id)) return false;
    return true;
  });

  if (eligibleCandidates.length === 0) {
    return [];
  }

  // 2. Shuffle for randomness
  const shuffled = shuffleArray(eligibleCandidates);

  // 3. Pick top N
  return shuffled.slice(0, count);
};

// Initial Mock Data Generator
export const generateMockData = (): Participant[] => {
  const depts = ['CNTT', 'Kế Toán', 'Nhân sự', 'Kinh doanh', 'Vận hành', 'Ban Giám Đốc', 'Marketing'];
  const firstNames = ['Anh', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hùng', 'Hương', 'Khánh', 'Lan', 'Minh', 'Nam', 'Oanh', 'Phúc', 'Quân', 'Sơn', 'Tú', 'Uyên', 'Vinh', 'Yến'];
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];

  const data: Participant[] = [];
  for (let i = 0; i < 150; i++) {
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const name = `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
    data.push({
      id: `user-${i}`,
      name: name,
      department: dept
    });
  }
  return data;
};

