import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface Raid {
  id: number;
  name: string;
  normalGold: number;
  hardGold: number;
}

type RaidMode = "none" | "normal" | "hard";

interface Selections {
  [raidId: number]: {
    [characterIndex: number]: RaidMode;
  };
}

const RaidCalculator = () => {
  const initialCharacters: string[] = Array(6)
    .fill("")
    .map((_, i) => `캐릭터${i + 1}`);

  const initialRaids: Raid[] = [
    { id: 1, name: "카양겔", normalGold: 4500, hardGold: 7500 },
    { id: 2, name: "아브렐슈드", normalGold: 4500, hardGold: 7500 },
    { id: 3, name: "일리아칸", normalGold: 4500, hardGold: 7500 },
    { id: 4, name: "쿠크세이튼", normalGold: 4500, hardGold: 7500 },
  ];

  const [characters] = useState<string[]>(initialCharacters);
  const [raids, setRaids] = useState<Raid[]>(initialRaids);
  const [selections, setSelections] = useState<Selections>(
    initialRaids.reduce(
      (acc, raid) => ({
        ...acc,
        [raid.id]: characters.reduce(
          (charAcc, _, charIndex) => ({
            ...charAcc,
            [charIndex]: "none" as RaidMode,
          }),
          {}
        ),
      }),
      {}
    )
  );

  const addRaid = (): void => {
    const newRaid: Raid = {
      id: raids.length + 1,
      name: `레이드${raids.length + 1}`,
      normalGold: 4500,
      hardGold: 7500,
    };
    setRaids([...raids, newRaid]);
    setSelections({
      ...selections,
      [newRaid.id]: characters.reduce(
        (acc, _, index) => ({
          ...acc,
          [index]: "none" as RaidMode,
        }),
        {}
      ),
    });
  };

  const handleSelectionChange = (
    raidId: number,
    charIndex: number,
    value: RaidMode
  ): void => {
    setSelections({
      ...selections,
      [raidId]: {
        ...selections[raidId],
        [charIndex]: value,
      },
    });
  };

  const calculateRaidTotal = (raidId: number): number => {
    return Object.entries(selections[raidId]).reduce((total, [, mode]) => {
      if (mode === "normal") {
        return total + raids.find((r) => r.id === raidId)!.normalGold;
      } else if (mode === "hard") {
        return total + raids.find((r) => r.id === raidId)!.hardGold;
      }
      return total;
    }, 0);
  };

  const calculateCharacterTotal = (charIndex: number): number => {
    return raids.reduce((total, raid) => {
      const mode = selections[raid.id][charIndex];
      if (mode === "normal") {
        return total + raid.normalGold;
      } else if (mode === "hard") {
        return total + raid.hardGold;
      }
      return total;
    }, 0);
  };

  const calculateGrandTotal = (): number => {
    return characters.reduce((total, _, charIndex) => {
      return total + calculateCharacterTotal(charIndex);
    }, 0);
  };

  const formatGold = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>주간 레이드 골드 계산기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse'>
            <thead>
              <tr>
                <th className='border p-2'>레이드</th>
                {characters.map((char, i) => (
                  <th key={i} className='border p-2'>
                    {char}
                  </th>
                ))}
                <th className='border p-2'>합계</th>
              </tr>
            </thead>
            <tbody>
              {raids.map((raid) => (
                <tr key={raid.id}>
                  <td className='border p-2'>{raid.name}</td>
                  {characters.map((_, charIndex) => (
                    <td key={charIndex} className='border p-2'>
                      <select
                        className='w-full p-1 border rounded'
                        value={selections[raid.id][charIndex]}
                        onChange={(e) =>
                          handleSelectionChange(
                            raid.id,
                            charIndex,
                            e.target.value as RaidMode
                          )
                        }
                      >
                        <option value='none'>선택안함</option>
                        <option value='normal'>
                          노말 ({formatGold(raid.normalGold)}G)
                        </option>
                        <option value='hard'>
                          하드 ({formatGold(raid.hardGold)}G)
                        </option>
                      </select>
                    </td>
                  ))}
                  <td className='border p-2 text-right font-bold'>
                    {formatGold(calculateRaidTotal(raid.id))}G
                  </td>
                </tr>
              ))}
              <tr>
                <td className='border p-2'>
                  <button
                    onClick={addRaid}
                    className='flex items-center gap-1 text-blue-500 hover:text-blue-700'
                  >
                    <PlusCircle className='w-4 h-4' />
                    <span>레이드 추가</span>
                  </button>
                </td>
                {characters.map((_, charIndex) => (
                  <td
                    key={charIndex}
                    className='border p-2 text-right font-bold'
                  >
                    {formatGold(calculateCharacterTotal(charIndex))}G
                  </td>
                ))}
                <td className='border p-2 text-right font-bold bg-gray-100'>
                  {formatGold(calculateGrandTotal())}G
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaidCalculator;
