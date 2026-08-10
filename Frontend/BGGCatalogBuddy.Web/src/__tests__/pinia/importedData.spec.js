import { setActivePinia, createPinia, getActivePinia } from "pinia";
import useImportedDataStore from "@/stores/imported_data";
import mitt from "mitt";

describe("imported data store", () => {
  let emitter;

  //Create an instance of pinia and set it to the active pinia
  //instace before each test.
  beforeEach(() => {
    setActivePinia(createPinia());

    // Create a mock emitter
    emitter = mitt();
    emitter.emit = vi.fn(); // Spy on the emit function

    getActivePinia()._a = {
      config: {
        globalProperties: {
          $emitter: emitter,
        },
      },
    };
  });

  test("set theme", async () => {
    const store = useImportedDataStore();
    const jsonFile = { game: { id: 1, name: "7 Wonders" } };
    const playerImages = [{ base64: "", filename: "player_1.jpg" }];

    expect(store.data_lastImportDate).toBe(null);
    expect(store.data_jsonFile).toBe(null);
    expect(store.data_playerImages.length).toBe(0);

    await store.data_storeData(jsonFile, playerImages);

    expect(store.data_lastImportDate).not.toBe(null);
    expect(store.data_jsonFile).toStrictEqual(jsonFile);
    expect(store.data_playerImages).toStrictEqual(playerImages);
    expect(emitter.emit).toHaveBeenCalledWith("dataImported");
  });

  test("adds player Elo metadata to imported plays", async () => {
    const store = useImportedDataStore();
    const jsonFile = {
      plays: [
        { id: 1, gameId: 1, playDate: "2024-01-01T00:00:00Z" },
        { id: 2, gameId: 2, playDate: "2024-01-02T00:00:00Z" },
      ],
      games: [
        { id: 1, averageweight: 3.5 },
        { id: 2, averageweight: 2.0 },
      ],
      players: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Cara" },
      ],
      playersPlays: [
        { id: 101, playId: 1, playerId: 1, winner: 1, score: 100 },
        { id: 102, playId: 1, playerId: 2, winner: 0, score: 80 },
        { id: 103, playId: 1, playerId: 3, winner: 0, score: 70 },
        { id: 104, playId: 2, playerId: 1, winner: 0, score: 90 },
        { id: 105, playId: 2, playerId: 2, winner: 1, score: 110 },
        { id: 106, playId: 2, playerId: 3, winner: 0, score: 75 },
      ],
    };

    await store.data_storeData(jsonFile, []);

    const firstPlayForAlice = store.data_jsonFile.playersPlays.find(
      (x) => x.playerId === 1 && x.playId === 1
    );
    const secondPlayForAlice = store.data_jsonFile.playersPlays.find(
      (x) => x.playerId === 1 && x.playId === 2
    );

    expect(firstPlayForAlice.startingElo).toBe(1500);
    expect(firstPlayForAlice.endingElo).toBeCloseTo(
      firstPlayForAlice.startingElo + firstPlayForAlice.eloChange,
      5
    );
    expect(secondPlayForAlice.startingElo).toBe(firstPlayForAlice.endingElo);
    expect(secondPlayForAlice.endingElo).toBeCloseTo(
      secondPlayForAlice.startingElo + secondPlayForAlice.eloChange,
      5
    );
  });

  test("values position in Elo calculations even when the player does not win", async () => {
    const store = useImportedDataStore();
    const jsonFile = {
      plays: [{ id: 10, gameId: 99, playDate: "2024-03-01T00:00:00Z" }],
      games: [{ id: 99, averageweight: 2.5 }],
      players: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Cara" },
      ],
      playersPlays: [
        { id: 201, playId: 10, playerId: 1, winner: 0, score: 95 },
        { id: 202, playId: 10, playerId: 2, winner: 1, score: 100 },
        { id: 203, playId: 10, playerId: 3, winner: 0, score: 82 },
      ],
    };

    await store.data_storeData(jsonFile, []);

    const secondPlace = store.data_jsonFile.playersPlays.find((x) => x.playerId === 1);
    const lastPlace = store.data_jsonFile.playersPlays.find((x) => x.playerId === 3);

    expect(secondPlace.eloChange).toBeGreaterThan(lastPlace.eloChange);
  });

  test("treats tied placements as the same position in Elo calculations", async () => {
    const store = useImportedDataStore();
    const jsonFile = {
      plays: [{ id: 20, gameId: 100, playDate: "2024-04-01T00:00:00Z" }],
      games: [{ id: 100, averageweight: 3.0 }],
      players: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Cara" },
      ],
      playersPlays: [
        { id: 301, playId: 20, playerId: 1, winner: 1, score: 100 },
        { id: 302, playId: 20, playerId: 2, winner: 1, score: 100 },
        { id: 303, playId: 20, playerId: 3, winner: 0, score: 80 },
      ],
    };

    await store.data_storeData(jsonFile, []);

    const firstTieAlice = store.data_jsonFile.playersPlays.find((x) => x.playerId === 1);
    const firstTieBob = store.data_jsonFile.playersPlays.find((x) => x.playerId === 2);
    const thirdPlaceCara = store.data_jsonFile.playersPlays.find((x) => x.playerId === 3);

    expect(firstTieAlice.eloChange).toBe(firstTieBob.eloChange);
    expect(firstTieAlice.eloChange).toBeGreaterThan(thirdPlaceCara.eloChange);
  });

  test("does not assign Elo to solo plays", async () => {
    const store = useImportedDataStore();
    const jsonFile = {
      plays: [{ id: 30, gameId: 1, playDate: "2024-05-01T00:00:00Z" }],
      games: [{ id: 1, averageweight: 2.5 }],
      players: [{ id: 1, name: "Alice" }],
      playersPlays: [{ id: 401, playId: 30, playerId: 1, winner: 1, score: 50 }],
    };

    await store.data_storeData(jsonFile, []);

    const soloPlay = store.data_jsonFile.playersPlays.find((x) => x.playerId === 1);

    expect(soloPlay.startingElo).toBeUndefined();
    expect(soloPlay.eloChange).toBeUndefined();
    expect(soloPlay.endingElo).toBeUndefined();
  });

  test("uses a higher K-factor for provisional players", async () => {
    const store = useImportedDataStore();

    // Build 10 plays for Alice vs Bob so Alice becomes established, then one more.
    const plays = Array.from({ length: 11 }, (_, i) => ({
      id: i + 1,
      gameId: 1,
      playDate: `2024-01-${String(i + 1).padStart(2, "0")}T00:00:00Z`,
    }));
    const playersPlays = plays.flatMap((play, i) => [
      { id: play.id * 10 + 1, playId: play.id, playerId: 1, winner: 1, score: 100 },
      { id: play.id * 10 + 2, playId: play.id, playerId: 2, winner: 0, score: 80 },
    ]);

    const jsonFile = {
      plays,
      games: [{ id: 1, averageweight: 2.5 }],
      players: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
      playersPlays,
    };

    await store.data_storeData(jsonFile, []);

    const allAlicePlays = store.data_jsonFile.playersPlays
      .filter((x) => x.playerId === 1)
      .sort((a, b) => a.playId - b.playId);

    // First game (provisional) should produce a larger change than the 11th (established).
    const firstGame = allAlicePlays[0];
    const eleventhGame = allAlicePlays[10];

    expect(Math.abs(firstGame.eloChange)).toBeGreaterThan(
      Math.abs(eleventhGame.eloChange)
    );
  });

  test("applies restricted player penalty: Darien and Steven gain less when winning and lose more when losing", async () => {
    const store = useImportedDataStore();
    // Darien (playerId 3) is always restricted regardless of game.
    const jsonFile = {
      plays: [
        { id: 1, gameId: 4, locationId: 1, playDate: "2024-01-01T00:00:00Z" }, // owner wins
        { id: 2, gameId: 4, locationId: 2, playDate: "2024-01-02T00:00:00Z" }, // non-owner wins (control)
        { id: 3, gameId: 4, locationId: 3, playDate: "2024-01-03T00:00:00Z" }, // owner loses
        { id: 4, gameId: 4, locationId: 4, playDate: "2024-01-04T00:00:00Z" }, // non-owner loses (control)
      ],
      games: [{ id: 4, averageweight: 2.5 }],
      players: [
        { id: 3, name: "Darien" },
        { id: 6, name: "Karl" },
        { id: 10, name: "Peter" },
        { id: 5, name: "Adam" },
      ],
      playersPlays: [
        { id: 101, playId: 1, playerId: 3, winner: 1, score: 100 }, // Darien wins (owner)
        { id: 102, playId: 1, playerId: 6, winner: 0, score: 80 },  // Karl loses
        { id: 103, playId: 2, playerId: 10, winner: 1, score: 100 }, // Peter wins (non-owner)
        { id: 104, playId: 2, playerId: 5, winner: 0, score: 80 },   // Adam loses
        { id: 105, playId: 3, playerId: 6, winner: 1, score: 100 }, // Karl wins
        { id: 106, playId: 3, playerId: 3, winner: 0, score: 80 },  // Darien loses (owner)
        { id: 107, playId: 4, playerId: 10, winner: 1, score: 100 }, // Peter wins
        { id: 108, playId: 4, playerId: 5, winner: 0, score: 80 },   // Adam loses (non-owner)
      ],
    };

    await store.data_storeData(jsonFile, []);

    const darienWin = store.data_jsonFile.playersPlays.find((x) => x.playerId === 3 && x.playId === 1);
    const peterWin  = store.data_jsonFile.playersPlays.find((x) => x.playerId === 10 && x.playId === 2);
    const darienLoss = store.data_jsonFile.playersPlays.find((x) => x.playerId === 3 && x.playId === 3);
    const adamLoss   = store.data_jsonFile.playersPlays.find((x) => x.playerId === 5 && x.playId === 4);

    expect(darienWin.eloChange).toBeLessThan(peterWin.eloChange);
    expect(darienLoss.eloChange).toBeLessThan(adamLoss.eloChange);
  });
});
