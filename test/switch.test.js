import { convert, pick } from "../src";

const data = {
  employment: {
    start: "October 2, 2019",
    end: "July 10, 2021",
    company: "Super Shops",
    occupation: "Information security specialist",
  },
};

const data2 = {
  employment: {
    start: "September 5, 2020",
    end: null,
    company: "Custom Lawn Care",
    occupation: "Human resources administrative assistant",
  },
};

const data3 = {
  list: [data.employment, data2.employment],
};

describe("Switch", () => {
  const previousEmploymentSchema = {
    isActive: pick("_").fallback(false),
    company: pick(),
    occupation: pick(),
  };

  const currentEmploymentSchema = {
    isActive: pick("_").fallback(true),
    from: pick("start"),
    company: pick(),
    occupation: pick(),
  };

  test("for one item", () => {
    const schema = {
      job: pick("employment")
        .switch({
          true: previousEmploymentSchema,
          false: currentEmploymentSchema,
        })
        .case((employment) => Boolean(employment.end)),
    };

    const expected = {
      job: {
        isActive: false,
        company: "Super Shops",
        occupation: "Information security specialist",
      },
    };

    const expected2 = {
      job: {
        isActive: true,
        from: "September 5, 2020",
        company: "Custom Lawn Care",
        occupation: "Human resources administrative assistant",
      },
    };

    expect(convert({ schema, data })).toEqual(expected);
    expect(convert({ schema, data: data2 })).toEqual(expected2);
  });

  test("for each item in the list", () => {
    const schema = {
      list: pick()
        .switch({
          true: previousEmploymentSchema,
          false: currentEmploymentSchema,
        })
        .case((employment) => Boolean(employment.end))
        .each(),
    };

    const expected = {
      list: [
        {
          isActive: false,
          company: "Super Shops",
          occupation: "Information security specialist",
        },
        {
          isActive: true,
          from: "September 5, 2020",
          company: "Custom Lawn Care",
          occupation: "Human resources administrative assistant",
        },
      ],
    };

    const res = convert({ schema, data: data3 });
    expect(res).toEqual(expected);
  });

  test("for some items in the list", () => {
    const schema = {
      list: pick()
        .switch({
          true: previousEmploymentSchema,
          false: currentEmploymentSchema,
        })
        .case((employment) => Boolean(employment.end))
        .each((employment) => !employment.company.startsWith("Super")),
    };

    const expected = {
      list: [
        {
          isActive: true,
          from: "September 5, 2020",
          company: "Custom Lawn Care",
          occupation: "Human resources administrative assistant",
        },
      ],
    };

    const res = convert({ schema, data: data3 });
    expect(res).toEqual(expected);
  });
});
