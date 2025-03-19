#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, MintTo, Token, TokenAccount};

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod memorygame {
    use super::*;

    // Initialize the token mint
    pub fn initialize_mint(ctx: Context<InitializeMint>) -> Result<()> {
        // Set mint authority to the program's PDA
        let mint = &mut ctx.accounts.mint;
        mint.mint_authority = Some(*ctx.accounts.program_id.key);
        mint.freeze_authority = Some(*ctx.accounts.program_id.key);
        Ok(())
    }

    // Initialize user state
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.claimed = false;
        Ok(())
    }

    // Claim initial tokens
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        require!(!user_state.claimed, ErrorCode::AlreadyClaimed);

        // Mint 1 token to the user's ATA
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.user_ata.to_account_info(),
            authority: ctx.accounts.program_id.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token::mint_to(cpi_ctx, 1)?;

        user_state.claimed = true;
        Ok(())
    }

    // Place a bet
    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64) -> Result<()> {
        // Transfer tokens from user to program's ATA
        let transfer_ix = anchor_spl::token::transfer(ctx.accounts.transfer_ctx(), amount)?;
        Ok(())
    }

    // Resolve bet (win or lose)
    pub fn resolve_bet(ctx: Context<ResolveBet>, win: bool) -> Result<()> {
        if win {
            // Mint the same amount and transfer 2x to the user
            let mint_ix = MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.program_ata.to_account_info(),
                authority: ctx.accounts.program_id.to_account_info(),
            };
            token::mint_to(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_ix),
                amount,
            )?;

            // Transfer 2x tokens to user
            let transfer_ix = anchor_spl::token::transfer(ctx.accounts.transfer_ctx(), amount * 2)?;
        } else {
            // Burn the tokens
            let burn_ix = Burn {
                mint: ctx.accounts.mint.to_account_info(),
                from: ctx.accounts.program_ata.to_account_info(),
                authority: ctx.accounts.program_id.to_account_info(),
            };
            token::burn(
                CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_ix),
                amount,
            )?;
        }
        Ok(())
    }
}
#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,              // Ensures the account is initialized
        payer = payer,     // The payer for the account creation
        mint::decimals = 6, // Set the token decimals
        mint::authority = program_id, // Set the program as the mint authority
        mint::freeze_authority = program_id, // Set the program as the freeze authority
    )]
    pub mint: Account<'info, Mint>, // The mint account
    pub payer: Signer<'info>, // The payer for the account creation
    pub system_program: Program<'info, System>, // System program
    pub token_program: Program<'info, Token>, // Token program
    pub rent: Sysvar<'info, Rent>, // Rent sysvar
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,              // Ensures the account is initialized
        payer = payer,     // The payer for the account creation
        space = 8 + 1,     // Allocate space for the account (8 bytes for Anchor discriminator + 1 byte for `claimed` bool)
        seeds = [b"user_state", user.key().as_ref()], // PDA seeds
        bump,              // Automatically derive the bump
    )]
    pub user_state: Account<'info, UserState>, // The user state account
    pub user: Signer<'info>,                    // The user's wallet
    pub payer: Signer<'info>,                   // The payer for the account creation
    pub system_program: Program<'info, System>, // System program
}

#[account]
pub struct UserState {
    pub claimed: bool, // Whether the user has claimed their initial tokens
}
#[derive(Accounts)]
pub struct Claim<'info> {
    #[account(
        mut,              // Mutable account
        seeds = [b"user_state", user.key().as_ref()], // PDA seeds
        bump,             // Automatically derive the bump
        has_one = user,   // Ensure the user state account belongs to the user
    )]
    pub user_state: Account<'info, UserState>, // The user state account
    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>, // The user's associated token account
    #[account(mut)]
    pub mint: Account<'info, Mint>, // The token mint
    pub user: Signer<'info>,                  // The user's wallet
    pub token_program: Program<'info, Token>, // Token program
}
#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>, // The user's associated token account
    #[account(mut)]
    pub program_ata: Account<'info, TokenAccount>, // The program's associated token account
    pub user: Signer<'info>,                  // The user's wallet
    pub token_program: Program<'info, Token>, // Token program
}

impl<'info> PlaceBet<'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_ata.to_account_info(),
            to: self.program_ata.to_account_info(),
            authority: self.user.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}
#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(mut)]
    pub user_ata: Account<'info, TokenAccount>, // The user's associated token account
    #[account(mut)]
    pub program_ata: Account<'info, TokenAccount>, // The program's associated token account
    #[account(mut)]
    pub mint: Account<'info, Mint>, // The token mint
    pub user: Signer<'info>,                  // The user's wallet
    pub token_program: Program<'info, Token>, // Token program
}

impl<'info> ResolveBet<'info> {
    pub fn transfer_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.program_ata.to_account_info(),
            to: self.user_ata.to_account_info(),
            authority: self.program_id.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    pub fn mint_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.mint.to_account_info(),
            to: self.program_ata.to_account_info(),
            authority: self.program_id.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }

    pub fn burn_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Burn<'info>> {
        let cpi_accounts = Burn {
            mint: self.mint.to_account_info(),
            from: self.program_ata.to_account_info(),
            authority: self.program_id.to_account_info(),
        };
        CpiContext::new(self.token_program.to_account_info(), cpi_accounts)
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("The user has already claimed their initial tokens.")]
    AlreadyClaimed,
    #[msg("Insufficient tokens to place the bet.")]
    InsufficientTokens,
    #[msg("Invalid account provided.")]
    InvalidAccount,
}
