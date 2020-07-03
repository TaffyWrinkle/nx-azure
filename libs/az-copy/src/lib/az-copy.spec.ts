import { azCopy } from "./az-copy";

describe("azCopy", () => {
  it("should work", () => {
    expect(azCopy()).toEqual("az-copy");
  });
});
