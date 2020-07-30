<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\roles\StoreRole;
use App\Http\Requests\roles\UpdateRole;
use App\Models\Role;
use Illuminate\Http\Request;
use Savannabits\Savadmin\Helpers\ApiResponse;
use Yajra\DataTables\Facades\DataTables;

class RoleController extends Controller
{
    private $api;
    public function __construct(ApiResponse $apiResponse)
    {
        $this->api = $apiResponse;
    }

    /**
     * Display a listing of the resource (paginated).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $roles = Role::paginate();
        return $this->api->success()->message("List of Roles")->payload($roles)->send();
    }

    public function dt(Request $request) {
        return DataTables::eloquent(Role::latest())->make();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param StoreRole $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreRole $request)
    {
        try {
            $array = $request->sanitizedArray();
            $role = new Role($array);
            $role->name = str_slug($role->display_name);
            $role->saveOrFail();
            return $this->api->success()->message('Role Created')->payload($role)->send();
        } catch (\Throwable $exception) {
            \Log::error($exception);
            return $this->api->failed()->message($exception->getMessage())->payload([])->code(500)->send();
        }
    }

    /**
     * Display the specified resource.
     *
     * @param Request $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, Role $role)
    {
        try {
            return $this->api->success()->message("Role $role->id")->payload($role)->send();
        } catch (\Throwable $exception) {
            return $this->api->failed()->message($exception->getMessage())->send();
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param UpdateRole $request
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateRole $request, Role $role)
    {
        try {
            $data = $request->sanitizedArray();
            $role->update($data);
            $role->name = str_slug($role->display_name);
            $role->saveOrFail();
            return $this->api->success()->message("Role has been updated")->payload($role)->code(200)->send();
        } catch (\Throwable $exception) {
            \Log::error($exception);
            return $this->api->failed()->code(400)->message($exception->getMessage())->send();
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Role $role
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     */
    public function destroy(Role $role)
    {
        $role->delete();
        return $this->api->success()->message("Role has been deleted")->payload($role)->code(200)->send();
    }
}