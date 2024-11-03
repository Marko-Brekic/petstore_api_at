import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import testData from "../data/test-data.json";

test.describe("User tests", () => {

    const username = faker.internet.userName();
    const password = testData.user.password;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email();
    const phone = faker.phone.number();

    test("Verify that it is possible to create a user", async ({ request }) => {

        const response = await request.post(`/v2/user`, {
            data: {
                "id": 0,
                "username": username,
                "firstName": firstName,
                "lastName": lastName,
                "email": email,
                "password": password,
                "phone": phone,
                "userStatus": 0
            }
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty("code", 200);

        const created = await request.get(`/v2/user/${username}`);
        expect(created.ok()).toBeTruthy();
        expect(created.status()).toBe(200);

        const createdResponseBody = await created.json();
        expect(createdResponseBody.username).toBe(username);
        expect(createdResponseBody.firstName).toBe(firstName);
        expect(createdResponseBody.lastName).toBe(lastName);
        expect(createdResponseBody.email).toBe(email);
        expect(createdResponseBody.phone).toBe(phone);
    });

    test("Verify that it is possible to log in a user", async ({ request }) => {

        const response = await request.get(`/v2/user/login`, {
            params: {
                username,
                password
            }
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        expect(responseBody).toHaveProperty("code", 200);
        expect(responseBody.message).toContain("logged in user");
    });

    test("Verify that it is possible to log out user", async ({ request }) => {

        const response = await request.get(`/v2/user/logout`);
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        
        const responseBody = await response.json();
        expect(responseBody).toHaveProperty("code", 200);
        expect(responseBody).toHaveProperty("message", "ok");
    });

    test("Verify that it is possible to create a list of users", async ({ request }) => {

        const groupUser1 = faker.internet.userName();
        const groupUser2 = faker.internet.userName();
        const groupUser3 = faker.internet.userName();

        const response = await request.post(`/v2/user/createWithList`, {
            data: [
                {
                    "id": 0,
                    "username": groupUser1,
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "password": password,
                    "phone": phone,
                    "userStatus": 0
                },
                {
                    "id": 0,
                    "username": groupUser2,
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "password": password,
                    "phone": phone,
                    "userStatus": 0
                },
                {
                    "id": 0,
                    "username": groupUser3,
                    "firstName": firstName,
                    "lastName": lastName,
                    "email": email,
                    "password": password,
                    "phone": phone,
                    "userStatus": 0
                }
            ]
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);

        const findUser1 = await request.get(`/v2/user/${groupUser1}`);
        let responseBody = await findUser1.json();
        expect(responseBody.username).toContain(groupUser1);
        const findUser2 = await request.get(`/v2/user/${groupUser2}`);
        responseBody = await findUser2.json();
        expect(responseBody.username).toContain(groupUser2);
        const findUser3 = await request.get(`/v2/user/${groupUser3}`);
        responseBody = await findUser3.json();
        expect(responseBody.username).toContain(groupUser3);
    });
});

test.describe("Pet tests", () => {
    
    let testPet = {};

    test.beforeAll(async ({ request }) => {
        
        const petId = faker.number.int(100000);
        const petName = faker.person.firstName();
        
        const response = await request.post(`/v2/pet`, {
            data: {
                "id": petId,
                "category": {
                  "id": 0,
                  "name": "Fish"
                },
                "name": petName,
                "photoUrls": [
                    testData.pet.initialImage
                ],
                "tags": [
                  {
                    "id": 0,
                    "name": "fish"
                  }
                ],
                "status": "available"
            }
        });
    
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        const responseBody = await response.json();

        testPet = {
            id: responseBody.id,
            name: responseBody.name
        };

        console.log("Pet created with ID:", testPet.id);
        console.log("Pet name:", testPet.name);
    });

    test("Verify that it is possible to add a pet", async ({ request }) => {

        console.log("Using pet ID:", testPet.id);
        console.log("Using pet name:", testPet.name);

        const createdPet = await request.get(`/v2/pet/${testPet.id}`);
        expect(createdPet.ok()).toBeTruthy();
        expect(createdPet.status()).toBe(200);

        const createdPetResponseBody = await createdPet.json();
        expect(createdPetResponseBody.id).toBe(testPet.id);
        expect(createdPetResponseBody.name).toBe(testPet.name);
    });

    test("Verify that it is possible to update a pet's image", async ({ request }) => {
        
        console.log("Using pet ID:", testPet.id);
        console.log("Using pet name:", testPet.name);

        const response = await request.put(`/v2/pet/`, {
            data: {
                "id": testPet.id,
                "category": {
                  "id": 0,
                  "name": "Fish"
                },
                "name": testPet.name,
                "photoUrls": [
                    testData.pet.updatedImage
                ],
                "tags": [
                  {
                    "id": 0,
                    "name": "fish"
                  }
                ],
                "status": "available"
            }
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
       
        const updatedPet = await request.get(`/v2/pet/${testPet.id}`);
        expect(updatedPet.ok()).toBeTruthy();
        expect(updatedPet.status()).toBe(200);

        const updatedPetResponseBody = await updatedPet.json();
        expect(updatedPetResponseBody.photoUrls[0]).toBe(
             "https://www.madeinsea.co/cdn/shop/articles/bubble-eye-goldfish-biography.jpg?v=1696202268&width=1024"
        );
    });

    test("Verify that it is possible to update a pet's name and status", async ({ request }) => {
        
        console.log("Using pet ID:", testPet.id);
        console.log("Using pet name:", testPet.name);

        const changedName = faker.person.firstName();

        const response = await request.put(`/v2/pet/`, {
            data: {
                "id": testPet.id,
                "category": {
                  "id": 0,
                  "name": "Fish"
                },
                "name": changedName,
                "photoUrls": [
                    testData.pet.updatedImage
                ],
                "tags": [
                  {
                    "id": 0,
                    "name": "fish"
                  }
                ],
                "status": "not available"
            }
        });

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
       
        const updatedPet = await request.get(`/v2/pet/${testPet.id}`);
        expect(updatedPet.ok()).toBeTruthy();
        expect(updatedPet.status()).toBe(200);

        const updatedPetResponseBody = await updatedPet.json();
        expect(updatedPetResponseBody.name).toBe(changedName);
        expect(updatedPetResponseBody.status).toBe("not available");

        console.log("Updated pet name:", updatedPetResponseBody.name);
        console.log("Updated pet status:", updatedPetResponseBody.status);
    });

    test("Verify that it is possible to delete a pet", async ({ request }) => {
        
        console.log("Using pet ID:", testPet.id);

        const response = await request.delete(`/v2/pet/${testPet.id}`);

        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
       
        const updatedPet = await request.get(`/v2/pet/${testPet.id}`);
        expect(updatedPet.ok()).toBeFalsy();
        expect(updatedPet.status()).toBe(404);
    });
});