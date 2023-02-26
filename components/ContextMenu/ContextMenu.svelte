<script context="module" lang="ts">
    type ContextMenuItemAction = () => any | { url: string };

    export type ContextMenuItemType = 'button' | 'group' | 'radio';

    export interface ContextMenuItemConfig {
        id?: string;
        label?: string;
        children?: ContextMenuItemConfig[];
        icon?: SVGElement;
        action?: ContextMenuItemAction;
        overrideTextColor?: boolean;
        type?: ContextMenuItemType;
        value?: string | number;
    }

    export interface ContextMenuConfig {
        items: ContextMenuItemConfig[];
    }
</script>

<script lang="ts">
    import { noop } from 'svelte/internal';
    import clickOutside from '@amp/web-app-components/src/actions/click-outside';
    import ContextMenuGroup from './ContextMenuGroup.svelte';
    import ContextMenuItem from './ContextMenuItem.svelte';

    export let showCaret: boolean = false;
    export let config: ContextMenuConfig;
    export let isOpen: boolean = false;
    export let onItemClick: (item?: EventTarget) => void = noop;

    // Whether to use center-aligned bottom menu style when sidebar is hidden
    export let repositionOnMobile: boolean = true;

    let id: string;
    let menuTriggerElement: HTMLElement;
    let shouldRenderLeft: boolean = false;
    let shouldRenderRight: boolean = false;
    let shouldRenderAbove: boolean = false;

    const handleTriggerClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Fall back on trigger element position when keyboard is used to
        // trigger click event
        const rect = menuTriggerElement.getBoundingClientRect();

        const posX = e.clientX || rect.x;
        const posY = e.clientY || rect.y;

        shouldRenderLeft = posX > window.innerWidth / 2;
        shouldRenderRight = posX < window.innerWidth / 2;
        shouldRenderAbove = posY > window.innerHeight / 2;
        isOpen = !isOpen;
    };

    const handleClickOutside = () => {
        isOpen = false;
    };

    function handleItemClick(item: EventTarget): void {
        onItemClick(item);
        isOpen = false;
    }
</script>

<!-- TODO: rdar://100783106 (JMOTW: AX: Enhance keyboard navigation of My Account menu) -->

<div
    class="context-menu-container"
    data-testid="context-menu-container"
    use:clickOutside={handleClickOutside}
>
    <div
        on:click|preventDefault={(e) => handleTriggerClick(e)}
        data-testid="context-menu-trigger"
        class="context-menu-trigger"
        bind:this={menuTriggerElement}
    >
        <slot name="trigger" />
    </div>
    {#if isOpen && config.items.length > 0}
        <div
            {id}
            class="context-menu"
            class:show-caret={showCaret}
            class:render-left={shouldRenderLeft}
            class:render-right={shouldRenderRight}
            class:render-above={shouldRenderAbove}
            class:reposition-on-mobile={repositionOnMobile}
            role="menu"
            tabindex="-1"
        >
            {#each config.items as contextMenuItem}
                {#if contextMenuItem.type === 'group'}
                    <ContextMenuGroup
                        group={contextMenuItem}
                        onItemClick={handleItemClick}
                    />
                {:else}
                    <ContextMenuItem
                        item={contextMenuItem}
                        onItemClick={handleItemClick}
                    />
                {/if}
            {/each}
            <slot name="body" />
        </div>
    {/if}
</div>

<style lang="scss">
    $context-menu-min-width: 185px;
    $context-menu-max-width: 350px;
    $context-menu-border-radius: 6px;
    $context-menu-border: 0.5px solid rgba(0, 0, 0, 0.2);
    $context-menu-caret-vertical-offset: 7px;
    $context-menu-caret-horizontal-offset: 8px;

    .context-menu {
        --contextMenuZindex: #{map-get($-z-layers, contextual-menus)};
        position: var(--contextMenuPosition, absolute);
        border-radius: $context-menu-border-radius;
        border: $context-menu-border;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2),
            0 8px 40px var(--dialogShadowColor);
        line-height: 0; // Reset to normalize container height
        z-index: var(--contextMenuZindex, auto);
        box-sizing: border-box;

        @include system-standard-thick-material();

        // TODO: Remove if rdar://95889603 (amp-chrome-player: User menu `backdrop-filter`
        // is negated on Chrome) is completed. See `context-menu-item` below, as well.
        @include target-chrome {
            // Chrome does not support nested `backdrop-filter`s.
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1318678
            // We can show the Increased Contrast material sourceover instead.
            background-color: var(
                --systemStandardThickMaterialSover-default_IC
            );
            backdrop-filter: none;
        }

        min-width: $context-menu-min-width;
        max-width: $context-menu-max-width;
    }

    .reposition-on-mobile {
        // Mobile styles
        @include viewport('range:sidebar:hidden down') {
            $context-menu-mobile-width: 270px;
            width: $context-menu-mobile-width;
            max-height: calc(100vh - var(--bodyGutter, $body-gutter-xs) * 2);
            position: fixed;
            top: initial !important; /* stylelint-disable-line declaration-no-important */

            // `!important` overrides the values provided inline
            bottom: var(
                --bodyGutter,
                $body-gutter-xs
            ) !important; /* stylelint-disable-line */

            @include global-transition(transform, 0.2s, ease);
            @include position-inline-start(
                calc(50vw - #{$context-menu-mobile-width / 2}) !important
            ); /* stylelint-disable-line declaration-no-important */
            @include position-inline-end(
                calc(50vw - #{$context-menu-mobile-width / 2}) !important
            ); /* stylelint-disable-line declaration-no-important */
        }
    }

    // TODO: rdar://96175884 (JMOTW: User menu caret has a space below its shadow)
    .context-menu.show-caret {
        @include viewport('sidebar:visible') {
            &::before,
            &::after {
                content: '';
                position: absolute;
                top: -$context-menu-caret-vertical-offset;
                left: $context-menu-caret-horizontal-offset;
                display: block;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 7px 7px 7px; // https://www.csstriangle.com/
                border-color: transparent transparent
                    var(--playerBackground, black) transparent;
                background-color: transparent;
                cursor: pointer;

                @include z(default, -1);
                @include position-inline-end(6px);
            }

            &::after {
                top: -$context-menu-caret-vertical-offset - 1px;
                border-color: transparent transparent rgba(0, 0, 0, 0.2)
                    transparent;

                @include z(default, -2);
            }
        }
    }

    .context-menu-trigger {
        cursor: pointer;
    }

    .context-menu-container {
        position: relative;
    }

    @include viewport('sidebar:visible') {
        .context-menu.render-left {
            transform: translateX(-85%);

            &::before,
            &::after {
                left: auto;
                right: $context-menu-caret-horizontal-offset;
                top: -$context-menu-caret-vertical-offset;
            }

            &::after {
                top: -$context-menu-caret-vertical-offset - 1px;
            }
        }

        .context-menu.render-right {
            transform: translateX(85%);

            &::before,
            &::after {
                left: $context-menu-caret-horizontal-offset;
                right: auto;
                top: -$context-menu-caret-vertical-offset;
            }

            &::after {
                top: -$context-menu-caret-vertical-offset - 1px;
            }
        }

        .context-menu.render-above {
            transform: translateY(-130%);

            &::before,
            &::after {
                top: auto;
                left: $context-menu-caret-horizontal-offset;
                bottom: -$context-menu-caret-vertical-offset;
                transform: rotate(180deg);
            }

            &::after {
                bottom: -$context-menu-caret-vertical-offset - 1px;
            }
        }

        .context-menu.render-left.render-above {
            transform: translateX(-85%) translateY(-130%);

            &::before,
            &::after {
                transform: rotate(180deg);
                left: auto;
                top: auto;
                right: $context-menu-caret-horizontal-offset;
                bottom: -$context-menu-caret-vertical-offset;
            }

            &::after {
                bottom: -$context-menu-caret-vertical-offset - 1px;
            }
        }

        .context-menu.render-right.render-above {
            transform: translateX(85%) translateY(-130%);

            &::before,
            &::after {
                transform: rotate(180deg);
                left: auto;
                top: auto;
                left: $context-menu-caret-horizontal-offset;
                bottom: -$context-menu-caret-vertical-offset;
            }

            &::after {
                bottom: -$context-menu-caret-vertical-offset - 1px;
            }
        }
    }
</style>
