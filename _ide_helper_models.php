<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Password> $passwords
 * @property-read int|null $passwords_count
 * @property-read \App\Models\User|null $user
 * @method static \Database\Factories\FolderFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Folder query()
 */
	class Folder extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property \App\Enums\PasswordTypes $type
 * @property-read mixed $cli
 * @property-read \App\Models\Folder|null $folder
 * @property mixed $password
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password expiresSoon()
 * @method static \Database\Factories\PasswordFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password filterByFolder(?int $folderId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password filterByType(\App\Enums\PasswordTypes $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password sortByCopied()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Password sortByLastUsed()
 */
	class Password extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Folder> $folders
 * @property-read int|null $folders_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Password> $passwords
 * @property-read int|null $passwords_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent {}
}

