<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('functions → api_response returns success status for 200', function () {
    $response = api_response(['key' => 'value'], 200);

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(200);
    expect($data['status'])->toBe('success');
    expect($data['data'])->toBe(['key' => 'value']);
});

test('functions → api_response returns success status for 201', function () {
    $response = api_response(['created' => true], 201);

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(201);
    expect($data['status'])->toBe('success');
    expect($data['data'])->toBe(['created' => true]);
});

test('functions → api_response returns fail status for 400', function () {
    $response = api_response(null, 400, 'Bad Request');

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(400);
    expect($data['status'])->toBe('fail');
    expect($data['message'])->toBe('Bad Request');
});

test('functions → api_response returns fail status for 404', function () {
    $response = api_response(null, 404, 'Not Found');

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(404);
    expect($data['status'])->toBe('fail');
    expect($data['message'])->toBe('Not Found');
});

test('functions → api_response returns fail status for 422', function () {
    $response = api_response(null, 422, 'Validation Error', ['field' => ['Required']]);

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(422);
    expect($data['status'])->toBe('fail');
    expect($data['message'])->toBe('Validation Error');
    expect($data['errors'])->toBe(['field' => ['Required']]);
});

test('functions → api_response returns error status for 500', function () {
    $response = api_response(null, 500, 'Server Error');

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(500);
    expect($data['status'])->toBe('error');
    expect($data['message'])->toBe('Server Error');
});

test('functions → api_response returns error status for 503', function () {
    $response = api_response(null, 503, 'Service Unavailable');

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(503);
    expect($data['status'])->toBe('error');
    expect($data['message'])->toBe('Service Unavailable');
});

test('functions → api_response uses default status 200', function () {
    $response = api_response(['default' => true]);

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(200);
    expect($data['status'])->toBe('success');
    expect($data['data'])->toBe(['default' => true]);
});

test('functions → api_response accepts null data', function () {
    $response = api_response(null, 200);

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(200);
    expect($data['status'])->toBe('success');
    expect($data['data'])->toBeNull();
});

test('functions → api_response accepts empty array data', function () {
    $response = api_response([], 200);

    $data = $response->getData(true);

    expect($response->getStatusCode())->toBe(200);
    expect($data['status'])->toBe('success');
    expect($data['data'])->toBe([]);
});

test('functions → api_response includes message when provided', function () {
    $response = api_response(['data' => 'test'], 200, 'Operation successful');

    $data = $response->getData(true);

    expect($data['message'])->toBe('Operation successful');
    expect($data)->toHaveKey('message');
});

test('functions → api_response excludes message when null', function () {
    $response = api_response(['data' => 'test'], 200, null);

    $data = $response->getData(true);

    expect($data)->not->toHaveKey('message');
});

test('functions → api_response excludes message when not provided', function () {
    $response = api_response(['data' => 'test'], 200);

    $data = $response->getData(true);

    expect($data)->not->toHaveKey('message');
});

test('functions → api_response includes errors when provided', function () {
    $errors = ['email' => ['The email field is required.']];
    $response = api_response(null, 422, 'Validation failed', $errors);

    $data = $response->getData(true);

    expect($data['errors'])->toBe($errors);
    expect($data)->toHaveKey('errors');
});

test('functions → api_response excludes errors when null', function () {
    $response = api_response(null, 400, 'Bad request', null);

    $data = $response->getData(true);

    expect($data)->not->toHaveKey('errors');
});

test('functions → api_response excludes errors when not provided', function () {
    $response = api_response(null, 400, 'Bad request');

    $data = $response->getData(true);

    expect($data)->not->toHaveKey('errors');
});

test('functions → api_response handles complex data structures', function () {
    $complexData = [
        'users' => [
            ['id' => 1, 'name' => 'John'],
            ['id' => 2, 'name' => 'Jane'],
        ],
        'meta' => [
            'total' => 2,
            'page' => 1,
        ],
    ];

    $response = api_response($complexData, 200, 'Users retrieved');

    $data = $response->getData(true);

    expect($data['data'])->toBe($complexData);
    expect($data['message'])->toBe('Users retrieved');
    expect($data['status'])->toBe('success');
});

test('functions → api_response handles empty string message', function () {
    $response = api_response(['data' => 'test'], 200, '');

    $data = $response->getData(true);

    expect($data['message'])->toBe('');
    expect($data)->toHaveKey('message');
});

test('functions → api_response handles empty array errors', function () {
    $response = api_response(null, 422, 'Validation failed', []);

    $data = $response->getData(true);

    expect($data['errors'])->toBe([]);
    expect($data)->toHaveKey('errors');
});

test('functions → api_response JSend compliance structure', function () {
    $response = api_response(['test' => 'data'], 200, 'Success message');

    $data = $response->getData(true);

    // JSend requires status and data fields
    expect($data)->toHaveKey('status');
    expect($data)->toHaveKey('data');

    // Optional message field
    expect($data)->toHaveKey('message');

    // Should not have any unexpected fields for success
    expect(array_keys($data))->toBe(['status', 'data', 'message']);
});

test('functions → api_response JSend compliance for fail with errors', function () {
    $response = api_response(null, 422, 'Validation failed', ['field' => 'error']);

    $data = $response->getData(true);

    // JSend fail can have data, message, and custom fields like errors
    expect($data)->toHaveKey('status');
    expect($data)->toHaveKey('data');
    expect($data)->toHaveKey('message');
    expect($data)->toHaveKey('errors');

    expect($data['status'])->toBe('fail');
});

test('functions → api_response edge case status codes', function () {
    // Test boundary status codes
    $response399 = api_response(null, 399);
    expect($response399->getData(true)['status'])->toBe('success');

    $response400 = api_response(null, 400);
    expect($response400->getData(true)['status'])->toBe('fail');

    $response499 = api_response(null, 499);
    expect($response499->getData(true)['status'])->toBe('fail');

    $response500 = api_response(null, 500);
    expect($response500->getData(true)['status'])->toBe('error');
});

test('functions → api_response returns JsonResponse instance', function () {
    $response = api_response(['test' => 'data']);

    expect($response)->toBeInstanceOf(\Illuminate\Http\JsonResponse::class);
});

test('functions → api_response handles string data', function () {
    $response = api_response('simple string', 200);

    $data = $response->getData(true);

    expect($data['data'])->toBe('simple string');
    expect($data['status'])->toBe('success');
});

test('functions → api_response handles numeric data', function () {
    $response = api_response(42, 200);

    $data = $response->getData(true);

    expect($data['data'])->toBe(42);
    expect($data['status'])->toBe('success');
});

test('functions → api_response handles boolean data', function () {
    $response = api_response(true, 200);

    $data = $response->getData(true);

    expect($data['data'])->toBe(true);
    expect($data['status'])->toBe('success');
});
