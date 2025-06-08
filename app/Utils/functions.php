<?php

if (!function_exists('api_response')) {
    function api_response($data = null, $status = 200, $message = null, $errors = null)
    {
        // Determine status based on HTTP status code following JSend specification
        $responseStatus = 'success';
        if ($status >= 400 && $status < 500) {
            $responseStatus = 'fail';
        } elseif ($status >= 500) {
            $responseStatus = 'error';
        }

        $response = [
            'status' => $responseStatus,
            'data' => $data,
        ];

        // Only add message if provided
        if ($message !== null) {
            $response['message'] = $message;
        }

        // Only add errors if provided (for fail/error status)
        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $status);
    }
}
