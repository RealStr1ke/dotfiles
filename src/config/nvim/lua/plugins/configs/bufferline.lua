local status_ok, bufferline = pcall(require, "bufferline")
if not status_ok then
    return
end


bufferline.setup({
    options = {
        numbers = "none", -- | "ordinal" | "buffer_id" | "both" | function({ ordinal, id, lower, raise }): string,
        close_command = "Bdelete! %d", -- can be a string | function, see "Mouse actions"
        right_mouse_command = nil, -- can be a string | function, see "Mouse actions"
        left_mouse_command = "buffer %d", -- can be a string | function, see "Mouse actions"
        middle_mouse_command = "Bdelete! %d", -- can be a string | function, see "Mouse actions"
        offsets = { { filetype = "NvimTree", text = "", padding = 1 } },
        
        max_name_length = 30,
        max_prefix_length = 30,
        tab_size = 21,
        indicator = {
            icon = '▎', -- this should be omitted if indicator style is not 'icon'
            style = 'icon', -- could be "underline"
        },

        show_buffer_icons = true,
        show_buffer_close_icons = true,
        show_close_icon = true,
        show_tab_indicators = true,
        always_show_bufferline = true,

        buffer_close_icon = '',
        modified_icon = "●",
        close_icon = "",
        left_trunc_marker = "",
        right_trunc_marker = "",

        separator_style = "slant",
        hover = {
            enabled = true,
            delay = 200,
            reveal = { 'close' }
        },

        diagnostics = "nvim_lsp",
        diagnostics_indicator = function(count, level, diagnostics_dict, context)
            local icon = level:match("error") and " " or " "
            return " " .. icon .. count
        end
    },

    highlights = {
        -- fill = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- background = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- tab = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- tab_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- tab_separator = {
        --   fg = '<colour-value-here>',
        --   bg = '<colour-value-here>',
        -- },
        -- tab_separator_selected = {
        --   fg = '<colour-value-here>',
        --   bg = '<colour-value-here>',
        --   sp = '<colour-value-here>',
        --   underline = '<colour-value-here>',
        -- },
        -- tab_close = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- close_button = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- close_button_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- close_button_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- buffer_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- buffer_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- numbers = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- numbers_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- numbers_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- diagnostic = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- diagnostic_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- diagnostic_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- hint = {
        --     fg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- hint_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- hint_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- hint_diagnostic = {
        --     fg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- hint_diagnostic_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- hint_diagnostic_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- info = {
        --     fg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- info_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- info_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- info_diagnostic = {
        --     fg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- info_diagnostic_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- info_diagnostic_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- warning = {
        --     fg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- warning_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- warning_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- warning_diagnostic = {
        --     fg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- warning_diagnostic_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- warning_diagnostic_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- error = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        -- },
        -- error_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- error_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- error_diagnostic = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        -- },
        -- error_diagnostic_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- error_diagnostic_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     sp = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- modified = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- modified_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- modified_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- duplicate_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     italic = true,
        -- },
        -- duplicate_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     italic = true,
        -- },
        -- duplicate = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     italic = true,
        -- },
        -- separator_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- separator_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- separator = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- indicator_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- indicator_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- pick_selected = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- pick_visible = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- pick = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        --     bold = true,
        --     italic = true,
        -- },
        -- offset_separator = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- },
        -- trunc_marker = {
        --     fg = '<colour-value-here>',
        --     bg = '<colour-value-here>',
        -- }
    }
})
