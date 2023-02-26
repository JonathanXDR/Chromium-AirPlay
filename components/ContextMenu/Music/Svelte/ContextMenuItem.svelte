<script lang="ts">
    import { noop } from 'svelte/internal';
    import type { ContextMenuItemConfig } from './ContextMenu.svelte';
    export let item: ContextMenuItemConfig;
    export let onItemClick: (item?: EventTarget) => void = noop;
    export let group: ContextMenuItemConfig = null;

    function handleItemClick(e: MouseEvent | Event) {
        onItemClick(e.target);
    }
</script>

{#if item.type === 'radio'}
    <div
        class="context-menu-item"
        class:group-item={group?.id}
        role="menuitem"
        data-testid={item.id}
    >
        <input
            type="radio"
            id={item.id}
            name={group?.id || item.id}
            checked={item.id === group?.value}
            on:change={handleItemClick}
        />
        <label for={item.id}>{item.label}</label>
    </div>
{:else if item.type === 'button'}
    <button
        class="context-menu-item"
        class:override-text-color={item.overrideTextColor}
        class:group-item={group?.id}
        role="menuitem"
        name={group?.id || item.id}
        id={item.id}
        data-testid={item.id}
        on:click={handleItemClick}
    >
        {item.label}
        {#if item.icon}
            <div class="icon">
                <svelte:component this={item.icon} aria-hidden="true" />
            </div>
        {/if}
    </button>
{/if}

<style lang="scss">
    $context-menu-item-height-mobile: 45px;
    $context-menu-item-height: 32px;
    $context-menu-item-icon-size: 16px;
    $context-menu-item-selected: 10px;
    $context-menu-item-padding: 10px;
    $context-menu-item-border: 0.5px solid rgba(0, 0, 0, 0.2);

    .context-menu-item {
        width: 100%;
        height: var(--contextMenuItemHeight, #{$context-menu-item-height});
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        color: var(--contextMenuTextColor);
        padding: $context-menu-item-padding 0;
        z-index: 1;
        border-bottom: $context-menu-item-border;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @include padding-inline-start($context-menu-item-padding);

        // TODO: Remove if rdar://95889603 (amp-chrome-player: User menu `backdrop-filter`
        // is negated on Chrome) is completed. See `context-menu` above, as well.
        @include target-chrome {
            @include prefers-dark {
                // Design settled on 30% white borders, due to Chrome nested `backdrop-filter` issue (also documented, above)
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1318678
                border-bottom-color: rgba(255, 255, 255, 0.3);
            }
        }

        &.group-item {
            border-bottom: none;
            justify-content: flex-start;

            @include target-chrome {
                @include prefers-dark {
                    border-bottom: none;
                }
            }
        }

        &:hover {
            background-color: rgba(0, 0, 0, 0.05);
        }

        &:focus {
            @include focus-shadow-alt;
        }

        & label {
            cursor: pointer;
            @include padding-inline-start($context-menu-item-padding);
        }

        & input[type='radio'] {
            /* Add if not using autoprefixer */
            -webkit-appearance: none;
            appearance: none;
            /* Not removed via appearance */
            margin: 0;
            display: flex;
            width: $context-menu-item-selected;
            height: $context-menu-item-selected;

            &:checked::before {
                content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 67.09 66.113'%3E%3Cpath d='M25.879 66.113c1.904 0 3.418-.83 4.492-2.49L65.967 7.324c.83-1.27 1.123-2.295 1.123-3.32C67.09 1.61 65.527 0 63.086 0c-1.758 0-2.734.586-3.809 2.295L25.684 56.2 8.008 32.373c-1.123-1.514-2.197-2.148-3.809-2.148-2.441 0-4.199 1.709-4.199 4.15 0 1.025.44 2.148 1.27 3.223l19.97 25.927c1.367 1.758 2.735 2.588 4.639 2.588Z' %3E%3C/path%3E%3C/svg%3E%0A");
                height: $context-menu-item-selected;
                width: $context-menu-item-selected;

                @include prefers-dark {
                    content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 67.09 66.113'%3E%3Cpath d='M25.879 66.113c1.904 0 3.418-.83 4.492-2.49L65.967 7.324c.83-1.27 1.123-2.295 1.123-3.32C67.09 1.61 65.527 0 63.086 0c-1.758 0-2.734.586-3.809 2.295L25.684 56.2 8.008 32.373c-1.123-1.514-2.197-2.148-3.809-2.148-2.441 0-4.199 1.709-4.199 4.15 0 1.025.44 2.148 1.27 3.223l19.97 25.927c1.367 1.758 2.735 2.588 4.639 2.588Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E%0A");
                }
            }
        }
    }

    .context-menu-item .icon {
        width: $context-menu-item-icon-size;
        height: $context-menu-item-icon-size;
        display: block;
        box-sizing: content-box;
        fill: var(--contextMenuTextColor);

        @include padding-inline-end($context-menu-item-padding);

        img {
            width: 100%;
        }
    }

    .context-menu-item:last-child {
        border-bottom: 0px;
    }

    .context-menu-item.override-text-color {
        color: var(--contextMenuOverrideTextColor, var(--contextMenuTextColor));
    }
</style>
