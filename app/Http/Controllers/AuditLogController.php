<?php

namespace App\Http\Controllers;

use App\Http\Requests\AuditLog\IndexAuditLogRequest;
use App\Services\AuditLogQueryService;

class AuditLogController extends Controller
{
    public function __construct(
        protected AuditLogQueryService $auditLogQueryService
    ) {}

    /**
     * Display a listing of the audit logs.
     */
    public function index(IndexAuditLogRequest $request)
    {
        $filters = $this->auditLogQueryService->getFilterArray($request);
        $perPage = $filters['per_page'];

        $auditLogs = $this->auditLogQueryService->getFilteredAuditLogs(
            auth()->user(),
            $filters,
            paginate: true,
            perPage: $perPage
        );

        $webFilters = [
            'passwordId' => $filters['password_id'],
            'action' => $filters['action'],
            'startDate' => $filters['start_date'],
            'endDate' => $filters['end_date'],
            'search' => $filters['search'],
            'perPage' => $filters['per_page'],
            'sort' => $filters['sort'],
            'direction' => $filters['direction'],
        ];

        return inertia('audit-logs/index', [
            'auditLogs' => $auditLogs,
            'filters' => $webFilters,
            'availableActions' => $this->auditLogQueryService->getAvailableActions(),
            'userPasswords' => $this->auditLogQueryService->getUserPasswordsForFilter(auth()->user()),
        ]);
    }
}
