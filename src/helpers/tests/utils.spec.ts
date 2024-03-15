import { getErrorMessages } from "helpers/utils";

describe("utils", () => {
  describe(".getErrorMessages", () => {
    it("should return error messages", () => {
      const errors = [
        { property: "name", constraints: { isNotEmpty: "name should not be empty" } },
        { property: "age", constraints: { isNotEmpty: "age should not be empty" } },
        { property: "email" },
      ];

      const result = getErrorMessages(errors);

      expect(result).toEqual("name should not be empty, age should not be empty");
    });
  });
});
