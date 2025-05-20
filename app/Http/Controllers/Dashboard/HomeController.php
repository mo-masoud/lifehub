<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

class HomeController extends Controller
{
    public function __invoke()
    {

        return inertia('dashboard/home/index');
    }
}
