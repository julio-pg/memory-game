#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod memorygame {
    use super::*;

  pub fn close(_ctx: Context<CloseMemorygame>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.memorygame.count = ctx.accounts.memorygame.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.memorygame.count = ctx.accounts.memorygame.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeMemorygame>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.memorygame.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeMemorygame<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Memorygame::INIT_SPACE,
  payer = payer
  )]
  pub memorygame: Account<'info, Memorygame>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseMemorygame<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub memorygame: Account<'info, Memorygame>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub memorygame: Account<'info, Memorygame>,
}

#[account]
#[derive(InitSpace)]
pub struct Memorygame {
  count: u8,
}
