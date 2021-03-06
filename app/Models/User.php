<?php

namespace App\Models;
/* Imports */

use DateTimeInterface;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Laravel\Scout\Searchable;
use Rennokki\QueryCache\Traits\QueryCacheable;
use Spatie\Permission\Traits\HasPermissions;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use Searchable;
    use QueryCacheable;
    use Notifiable, HasApiTokens, HasPermissions, HasRoles;

//    public $cacheFor=60*60*24; //cache for 1 day
    protected static $flushCacheOnUpdate = true; //invalidate the cache when the database is changed
    protected $fillable = [
        'name',
        'first_name',
        'last_name',
        'middle_name',
        'username',
        'email',
        'email_verified_at',
    ];

    protected $searchable = [
        'id',
        'name',
        'first_name',
        'last_name',
        'middle_name',
        'username',
        'email',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',

    ];


    protected $dates = [
        'email_verified_at',
        'created_at',
        'updated_at',
    ];

    protected $appends = ["api_route"];

    public function toSearchableArray()
    {
        return collect($this->only($this->searchable))->merge([
            // Add more keys here
        ])->toArray();
    }

    /* ************************ ACCESSOR ************************* */

    public function getApiRouteAttribute()
    {
        return route("api.users.index");
    }

    protected function serializeDate(DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    /* ************************ RELATIONS ************************ */
}
