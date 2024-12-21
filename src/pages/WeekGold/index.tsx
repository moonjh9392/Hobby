import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit2, Check, Trash2 } from "lucide-react";

interface Raid {
  id: number;
  name: string;
  singleGold: number;
  normalGold: number;
  hardGold: number;
}

type RaidMode = "none" | "single" | "normal" | "hard";

const STORAGE_KEY = "raidCalculatorData";

const WeekGold = () => {
  // 초기 상태를 로컬 스토리지에서 불러오거나, 기본값 사용
  const loadInitialState = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return {
        characters:
          parsed.characters ||
          Array(6)
            .fill("")
            .map((_, i) => `캐릭터${i + 1}`),
        raids: parsed.raids || [
          {
            id: 1,
            name: "카양겔",
            singleGold: 3000,
            normalGold: 4500,
            hardGold: 7500,
          },
          {
            id: 2,
            name: "아브렐슈드",
            singleGold: 3000,
            normalGold: 4500,
            hardGold: 7500,
          },
          {
            id: 3,
            name: "일리아칸",
            singleGold: 3000,
            normalGold: 4500,
            hardGold: 7500,
          },
          {
            id: 4,
            name: "쿠크세이튼",
            singleGold: 3000,
            normalGold: 4500,
            hardGold: 7500,
          },
        ],
        selections: parsed.selections || {},
      };
    }

    // 기본값 반환
    const defaultRaids = [
      {
        id: 1,
        name: "카양겔",
        singleGold: 3000,
        normalGold: 4500,
        hardGold: 7500,
      },
      {
        id: 2,
        name: "아브렐슈드",
        singleGold: 3000,
        normalGold: 4500,
        hardGold: 7500,
      },
      {
        id: 3,
        name: "일리아칸",
        singleGold: 3000,
        normalGold: 4500,
        hardGold: 7500,
      },
      {
        id: 4,
        name: "쿠크세이튼",
        singleGold: 3000,
        normalGold: 4500,
        hardGold: 7500,
      },
    ];

    return {
      characters: Array(6)
        .fill("")
        .map((_, i) => `캐릭터${i + 1}`),
      raids: defaultRaids,
      selections: defaultRaids.reduce(
        (acc, raid) => ({
          ...acc,
          [raid.id]: Array(6)
            .fill("")
            .reduce(
              (charAcc, _, charIndex) => ({
                ...charAcc,
                [charIndex]: "none",
              }),
              {}
            ),
        }),
        {}
      ),
    };
  };

  const initialState = loadInitialState();
  const [characters, setCharacters] = useState<string[]>(
    initialState.characters
  );
  const [editingCharacter, setEditingCharacter] = useState<number | null>(null);
  const [raids, setRaids] = useState<Raid[]>(initialState.raids);
  const [selections, setSelections] = useState<
    Record<number, Record<number, RaidMode>>
  >(initialState.selections);

  const [newRaidForm, setNewRaidForm] = useState({
    name: "",
    singleGold: 0,
    normalGold: 0,
    hardGold: 0,
  });

  // 상태가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    const dataToSave = {
      characters,
      raids,
      selections,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [characters, raids, selections]);

  const resetData = (): void => {
    if (window.confirm("모든 데이터를 초기화하시겠습니까?")) {
      localStorage.removeItem(STORAGE_KEY);
      const defaultState = loadInitialState();
      setCharacters(defaultState.characters);
      setRaids(defaultState.raids);
      setSelections(defaultState.selections);
    }
  };

  const addRaid = (): void => {
    if (
      !newRaidForm.name ||
      !newRaidForm.singleGold ||
      !newRaidForm.normalGold ||
      !newRaidForm.hardGold
    ) {
      alert("레이드 정보를 모두 입력해주세요.");
      return;
    }

    const newRaid: Raid = {
      id: raids.length + 1,
      name: newRaidForm.name,
      singleGold: parseInt(newRaidForm.singleGold.toString()),
      normalGold: parseInt(newRaidForm.normalGold.toString()),
      hardGold: parseInt(newRaidForm.hardGold.toString()),
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

    setNewRaidForm({
      name: "",
      singleGold: 0,
      normalGold: 0,
      hardGold: 0,
    });
  };

  const deleteRaid = (raidId: number): void => {
    const newRaids = raids.filter((raid) => raid.id !== raidId);
    const newSelections = { ...selections };
    delete newSelections[raidId];
    setRaids(newRaids);
    setSelections(newSelections);
  };

  const handleCharacterEdit = (index: number): void => {
    setEditingCharacter(index);
  };

  const handleCharacterSave = (index: number, newName: string): void => {
    const newCharacters = [...characters];
    newCharacters[index] = newName;
    setCharacters(newCharacters);
    setEditingCharacter(null);
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
      const raid = raids.find((r) => r.id === raidId);
      if (!raid) return total;

      if (mode === "single") {
        return total + raid.singleGold;
      } else if (mode === "normal") {
        return total + raid.normalGold;
      } else if (mode === "hard") {
        return total + raid.hardGold;
      }
      return total;
    }, 0);
  };

  const calculateCharacterTotal = (charIndex: number): number => {
    return raids.reduce((total, raid) => {
      const mode = selections[raid.id][charIndex];
      if (mode === "single") {
        return total + raid.singleGold;
      } else if (mode === "normal") {
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
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle>주간 레이드 골드 계산기</CardTitle>
        <button
          onClick={resetData}
          className='flex items-center gap-1 text-gray-500 hover:text-gray-700'
          title='데이터 초기화'
        >
          <span>초기화</span>
        </button>
      </CardHeader>

      <CardContent>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse border border-gray-200'>
            <thead>
              <tr>
                <th className='border border-gray-200 p-2'>레이드</th>
                {characters.map((char, i) => (
                  <th key={i} className='border border-gray-200 p-2'>
                    {editingCharacter === i ? (
                      <div className='flex items-center gap-2'>
                        <input
                          type='text'
                          className='w-full p-1 border rounded'
                          value={char}
                          onChange={(e) => {
                            const newCharacters = [...characters];
                            newCharacters[i] = e.target.value;
                            setCharacters(newCharacters);
                          }}
                          onBlur={() => setEditingCharacter(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setEditingCharacter(null);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                            }
                          }}
                          autoFocus
                        />
                        <Check
                          className='w-4 h-4 cursor-pointer text-green-500'
                          onClick={() => handleCharacterSave(i, char)}
                        />
                      </div>
                    ) : (
                      <div className='flex items-center justify-between gap-2'>
                        <span>{char}</span>
                        <Edit2
                          className='w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-700'
                          onClick={() => handleCharacterEdit(i)}
                        />
                      </div>
                    )}
                  </th>
                ))}
                <th className='border border-gray-200 p-2'>합계</th>
              </tr>
            </thead>
            <tbody>
              {raids.map((raid) => (
                <tr key={raid.id}>
                  <td className='border border-gray-200 p-2'>
                    <div className='flex items-center justify-between'>
                      <span>{raid.name}</span>
                      <Trash2
                        className='w-4 h-4 cursor-pointer text-red-500 hover:text-red-700'
                        onClick={() => deleteRaid(raid.id)}
                      />
                    </div>
                  </td>
                  {characters.map((_, charIndex) => (
                    <td key={charIndex} className='border border-gray-200 p-2'>
                      <div className='flex flex-col space-y-2'>
                        <div className='flex flex-col space-y-1'>
                          <label className='flex items-center gap-2 text-sm cursor-pointer'>
                            <input
                              type='radio'
                              name={`raid-${raid.id}-char-${charIndex}`}
                              checked={
                                selections[raid.id][charIndex] === "none"
                              }
                              onChange={() =>
                                handleSelectionChange(
                                  raid.id,
                                  charIndex,
                                  "none"
                                )
                              }
                              className='form-radio'
                            />
                            <span>선택안함</span>
                          </label>
                          <label className='flex items-center gap-2 text-sm cursor-pointer'>
                            <input
                              type='radio'
                              name={`raid-${raid.id}-char-${charIndex}`}
                              checked={
                                selections[raid.id][charIndex] === "single"
                              }
                              onChange={() =>
                                handleSelectionChange(
                                  raid.id,
                                  charIndex,
                                  "single"
                                )
                              }
                              className='form-radio'
                            />
                            <span>싱글 ({formatGold(raid.singleGold)}G)</span>
                          </label>
                          <label className='flex items-center gap-2 text-sm cursor-pointer'>
                            <input
                              type='radio'
                              name={`raid-${raid.id}-char-${charIndex}`}
                              checked={
                                selections[raid.id][charIndex] === "normal"
                              }
                              onChange={() =>
                                handleSelectionChange(
                                  raid.id,
                                  charIndex,
                                  "normal"
                                )
                              }
                              className='form-radio'
                            />
                            <span>노말 ({formatGold(raid.normalGold)}G)</span>
                          </label>
                          <label className='flex items-center gap-2 text-sm cursor-pointer'>
                            <input
                              type='radio'
                              name={`raid-${raid.id}-char-${charIndex}`}
                              checked={
                                selections[raid.id][charIndex] === "hard"
                              }
                              onChange={() =>
                                handleSelectionChange(
                                  raid.id,
                                  charIndex,
                                  "hard"
                                )
                              }
                              className='form-radio'
                            />
                            <span>하드 ({formatGold(raid.hardGold)}G)</span>
                          </label>
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className='border border-gray-200 p-2 text-right font-bold'>
                    {formatGold(calculateRaidTotal(raid.id))}G
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={characters.length + 2}
                  className='border border-gray-200 p-2'
                >
                  <div className='flex items-center gap-4'>
                    <input
                      type='text'
                      placeholder='레이드 이름'
                      className='p-1 border rounded'
                      value={newRaidForm.name}
                      onChange={(e) =>
                        setNewRaidForm({ ...newRaidForm, name: e.target.value })
                      }
                    />
                    <input
                      type='number'
                      placeholder='싱글 골드'
                      className='p-1 border rounded w-32'
                      value={newRaidForm.singleGold}
                      onChange={(e) =>
                        setNewRaidForm({
                          ...newRaidForm,
                          singleGold: Number(e.target.value),
                        })
                      }
                    />
                    <input
                      type='number'
                      placeholder='노말 골드'
                      className='p-1 border rounded w-32'
                      value={newRaidForm.normalGold}
                      onChange={(e) =>
                        setNewRaidForm({
                          ...newRaidForm,
                          normalGold: Number(e.target.value),
                        })
                      }
                    />
                    <input
                      type='number'
                      placeholder='하드 골드'
                      className='p-1 border rounded w-32'
                      value={newRaidForm.hardGold}
                      onChange={(e) =>
                        setNewRaidForm({
                          ...newRaidForm,
                          hardGold: Number(e.target.value),
                        })
                      }
                    />
                    <button
                      onClick={addRaid}
                      className='flex items-center gap-1 text-blue-500 hover:text-blue-700'
                    >
                      <PlusCircle className='w-4 h-4' />
                      <span>레이드 추가</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td className='border border-gray-200 p-2 font-bold'>
                  캐릭터 총합
                </td>
                {characters.map((_, charIndex) => (
                  <td
                    key={charIndex}
                    className='border border-gray-200 p-2 text-right font-bold'
                  >
                    {formatGold(calculateCharacterTotal(charIndex))}G
                  </td>
                ))}
                <td className='border border-gray-200 p-2 text-right font-bold bg-gray-100'>
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

export default WeekGold;
