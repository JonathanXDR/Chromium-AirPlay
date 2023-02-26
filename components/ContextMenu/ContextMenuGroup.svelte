<script lang="ts">
    import { noop } from 'svelte/internal';
    import type { ContextMenuItemConfig } from './ContextMenu.svelte';
    import ContextMenuItem from './ContextMenuItem.svelte';

    export let group: ContextMenuItemConfig;
    export let onItemClick: (item?: EventTarget) => void = noop;
</script>

<div class="context-menu-group">
    {#each group.children as item}
        <ContextMenuItem {group} {item} {onItemClick} />
    {/each}
</div>

<style lang="scss">
    $context-menu-group-border: 0.5px solid rgba(0, 0, 0, 0.2);

    .context-menu-group {
        display: flex;
        flex-direction: column;
        border-bottom: $context-menu-group-border;

        &:last-child {
            border-bottom: 0;
        }

        @include target-chrome {
            @include prefers-dark {
                // Design settled on 30% white borders, due to Chrome nested `backdrop-filter` issue (also documented, above)
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1318678
                border-bottom-color: rgba(255, 255, 255, 0.3);
            }
        }
    }
</style>
