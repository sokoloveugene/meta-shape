import { convert, pick } from "../src";

const data = {
  info: {
    count: 51,
    pages: 3,
    next: "https://rickandmortyapi.com/api/episode?page=2",
    prev: null,
  },
  results: [
    {
      _id: 1,
      name: "Pilot",
      air_date: "December 2, 2014",
      episode: "S01E01",
      url: "https://rickandmortyapi.com/api/episode/1",
      created: "2017-11-10T12:56:33.798Z",
    },
    {
      _id: 2,
      name: "Lawnmower Dog",
      air_date: "December 9, 2013",
      episode: "S01E02",
      url: "https://rickandmortyapi.com/api/episode/2",
      created: "2017-11-10T12:56:33.916Z",
    },
  ],
};

describe("Apply", () => {
  test("reusable schema", () => {
    const paginationSchema = {
      nextAvailable: pick("next").pipe(Boolean),
      prevAvailable: pick("prev").pipe(Boolean),
      "deep.next": pick("next"),
      "deep.prev": pick("prev"),
    };

    const schema = {
      pagination: pick("info").apply(paginationSchema),
    };

    const expected = {
      pagination: {
        nextAvailable: true,
        prevAvailable: false,
        deep: {
          next: "https://rickandmortyapi.com/api/episode?page=2",
          prev: null,
        },
      },
    };

    expect(convert({ schema, data })).toEqual(expected);
  });

  test("reusable schema for each element of array", () => {
    const episodeSchema = {
      id: pick("_id"),
      name: pick(),
    };

    const schema = {
      edisodes: pick("results").apply(episodeSchema).each(),
    };

    const expected = {
      edisodes: [
        { id: 1, name: "Pilot" },
        { id: 2, name: "Lawnmower Dog" },
      ],
    };

    expect(convert({schema, data})).toEqual(expected);
  });

  test("reusable schema for some element of array", () => {
    const episodeSchema = {
      id: pick("_id"),
      name: pick(),
    };

    const schema = {
      edisodes: pick("results")
        .apply(episodeSchema)
        .each((episode) => episode.air_date === "December 9, 2013"),
    };

    const expected = {
      edisodes: [{ id: 2, name: "Lawnmower Dog" }],
    };

    expect(convert({schema, data})).toEqual(expected);
  });
});
