import { describe, expect, it } from "vitest";
import {
  MeetingOperationError,
  PluginDomainError,
  StorageRecordError,
} from "../src/errors.js";

describe("domain error classes", () => {
  it("instantiates domain error classes properly", () => {
    const e1 = new PluginDomainError("err1");
    expect(e1.name).toBe("PluginDomainError");
    expect(e1.message).toBe("err1");

    const e2 = new StorageRecordError("err2");
    expect(e2.name).toBe("StorageRecordError");

    const e3 = new MeetingOperationError("err3");
    expect(e3.name).toBe("MeetingOperationError");
  });
});
