<script lang="ts">
	import { enhance } from "$app/forms";
	import ShieldIcon from "@lucide/svelte/icons/shield";
	import PlusIcon from "@lucide/svelte/icons/plus";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import ScanIcon from "@lucide/svelte/icons/scan";
	import CheckIcon from "@lucide/svelte/icons/check";
	import InfoIcon from "@lucide/svelte/icons/info";
	import SearchIcon from "@lucide/svelte/icons/search";

	let { data, form } = $props();

	let selectedRoleId = $state("");
	let searchQuery = $state("");
	let isCreating = $state(false);

	const selectedRole = $derived(data.roles.find((r) => r.id === selectedRoleId));
	const filteredPermissions = $derived(
		data.permissions.filter((p) => 
			p.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
			p.name.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	// Group permissions by resource
	const groupedPermissions = $derived(
		filteredPermissions.reduce((acc, p) => {
			const resource = p.key.split(":")[0];
			if (!acc[resource]) acc[resource] = [];
			acc[resource].push(p);
			return acc;
		}, {} as Record<string, typeof data.permissions>)
	);

</script>

<div class="flex flex-col gap-6 p-6">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Role Management</h1>
			<p class="text-muted-foreground">Define roles and assign permissions to control access.</p>
		</div>
		<div class="flex items-center gap-2">
			<form action="?/scan" method="POST" use:enhance>
				<button class="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
					<ScanIcon class="size-4" />
					Scan Routes
				</button>
			</form>
			<button 
				onclick={() => isCreating = true}
				class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors"
			>
				<PlusIcon class="size-4" />
				New Role
			</button>
		</div>
	</div>

	{#if form?.message}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
			{form.message}
		</div>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[350px_1fr]">
		<!-- Roles List -->
		<div class="flex flex-col gap-4">
			<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
				<div class="flex flex-col space-y-1.5 p-6">
					<h3 class="font-semibold leading-none tracking-tight">Roles</h3>
					<p class="text-muted-foreground text-sm">Select a role to manage its permissions.</p>
				</div>
				<div class="p-0">
					<div class="flex flex-col">
						{#each data.roles as role}
							<button 
								onclick={() => selectedRoleId = role.id}
								class="flex flex-col gap-1 border-b p-4 text-left transition-colors hover:bg-muted/50 {selectedRoleId === role.id ? 'bg-muted' : ''} last:border-0"
							>
								<div class="flex items-center justify-between">
									<span class="font-semibold">{role.name}</span>
									<span class="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
										{role.userCount} Users
									</span>
								</div>
								<p class="text-muted-foreground line-clamp-1 text-xs">{role.description || 'No description'}</p>
							</button>
						{/each}
					</div>
				</div>
			</div>

			{#if isCreating}
				<div class="rounded-xl border bg-card p-6 shadow-sm">
					<h3 class="mb-4 font-semibold">Create New Role</h3>
					<form action="?/createRole" method="POST" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') isCreating = false;
						};
					}} class="space-y-4">
						<div class="space-y-2">
							<label for="name" class="text-sm font-medium">Role Name</label>
							<input id="name" name="name" placeholder="e.g. Moderator" class="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" required />
						</div>
						<div class="space-y-2">
							<label for="description" class="text-sm font-medium">Description</label>
							<textarea id="description" name="description" placeholder="Optional description..." class="flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"></textarea>
						</div>
						<div class="flex gap-2">
							<button type="submit" class="bg-primary text-primary-foreground h-9 flex-1 rounded-md px-3 text-sm font-medium">Save Role</button>
							<button type="button" onclick={() => isCreating = false} class="h-9 flex-1 rounded-md border px-3 text-sm font-medium">Cancel</button>
						</div>
					</form>
				</div>
			{/if}
		</div>

		<!-- Permissions Grid -->
		<div class="flex flex-col gap-4">
			{#if selectedRole}
				<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
					<div class="flex flex-col space-y-1.5 p-6 border-b">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg font-semibold tracking-tight">Permissions: {selectedRole.name}</h3>
								<p class="text-muted-foreground text-sm">Assign what this role can see and do.</p>
							</div>
							{#if !["admin", "editor", "viewer"].includes(selectedRole.id)}
								<form action="?/deleteRole" method="POST" use:enhance>
									<input type="hidden" name="id" value={selectedRole.id} />
									<button class="text-destructive hover:bg-destructive/10 rounded-md p-2 transition-colors">
										<Trash2Icon class="size-4" />
									</button>
								</form>
							{/if}
						</div>
					</div>

					<div class="p-6">
						<div class="mb-6 flex items-center gap-2">
							<div class="relative flex-1">
								<SearchIcon class="text-muted-foreground absolute top-2.5 left-3 size-4" />
								<input 
									type="text" 
									bind:value={searchQuery}
									placeholder="Search permissions..." 
									class="flex h-9 w-full rounded-md border bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								/>
							</div>
						</div>

						{#if selectedRole.id === 'admin'}
							<div class="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
								<div class="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full">
									<ShieldIcon class="size-6" />
								</div>
								<h3 class="text-lg font-semibold">Administrator Role</h3>
								<p class="text-muted-foreground max-w-[280px] text-sm">
									The admin role always has full access to all system features. Permissions cannot be restricted for this role.
								</p>
							</div>
						{:else}
							<form action="?/updatePermissions" method="POST" use:enhance class="space-y-8">
								<input type="hidden" name="roleId" value={selectedRole.id} />
								
								<div class="grid gap-8 md:grid-cols-2">
									{#each Object.entries(groupedPermissions) as [resource, perms]}
										<div class="space-y-3">
											<h4 class="text-xs font-bold tracking-wider text-muted-foreground uppercase">{resource}</h4>
											<div class="grid gap-2">
												{#each perms as permission}
													<label class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
														<input 
															type="checkbox" 
															name="permissions" 
															value={permission.id}
															checked={selectedRole.permissions.includes(permission.id)}
															class="size-4 rounded border-gray-300 text-primary focus:ring-primary"
														/>
														<div class="flex flex-col">
															<span class="text-sm font-medium">{permission.name}</span>
															<span class="text-muted-foreground text-[10px]">{permission.key}</span>
														</div>
													</label>
												{/each}
											</div>
										</div>
									{/each}
								</div>

								<div class="sticky bottom-0 bg-card/80 border-t pt-4 backdrop-blur-sm">
									<button type="submit" class="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold shadow-md transition-all">
										<CheckIcon class="size-4" />
										Save Changes
									</button>
								</div>
							</form>
						{/if}
					</div>
				</div>
			{:else}
				<div class="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
					<div class="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
						<InfoIcon class="text-muted-foreground size-6" />
					</div>
					<h3 class="text-lg font-semibold">No Role Selected</h3>
					<p class="text-muted-foreground max-w-[250px] text-sm">Select a role from the left to view and edit its system permissions.</p>
				</div>
			{/if}
		</div>
	</div>
</div>
