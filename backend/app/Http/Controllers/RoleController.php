<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    /**
     * Get all roles.
     */
    public function index()
    {
        $roles = Role::all();
        
        return response()->json([
            'success' => true,
            'data' => $roles
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255|unique:roles']);
        $role = Role::create(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Role berhasil ditambahkan', 'data' => $role], 201);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);
        $request->validate(['name' => 'required|string|max:255|unique:roles,name,' . $id]);
        $role->update(['name' => $request->name]);
        return response()->json(['success' => true, 'message' => 'Role berhasil diperbarui', 'data' => $role]);
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        $role->delete();
        return response()->json(['success' => true, 'message' => 'Role berhasil dihapus']);
    }
}
