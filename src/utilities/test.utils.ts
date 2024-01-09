/**
 * @dev meant to use only in tests
 * simulates data being sent as JSON type
 * @param body data expected in th body
 */
export const simulateResponseBody = (body: any) => {
    const bodyString = JSON.stringify(body)

    return JSON.parse(bodyString)
}