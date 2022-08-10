import {Digest} from "../dist/Digest";

import {describe, test, expect} from "@jest/globals";

describe("Digest", () => {
    describe("getAuthHeader", () => {
        test('Checks, that Digest.getAuthHeader() returns correct value.', () => {
            const testString = 'Digest realm="testrealm@host.com", qop="auth,auth-int", nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093", opaque="5ccc069c403ebaf9f0171e9517f40e41"';
            const value = 'Digest username="root",realm="testrealm@host.com",nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",uri="www.cz",response="63f54af3ce5cf193a7435d5c68625472",qop=auth,nc=00000001,cnonce="162d50aa594e9648"';
            expect(Digest.getAuthHeader("root", "pass", "GET", "www.cz", testString)).toBe(value);
        });
    })
})
