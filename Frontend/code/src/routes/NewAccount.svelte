<script>

    import {Link} from "svelte-routing"
    import { user } from "../user-store"
    
    let username = ""
    let password = ""

    let errorCodes = []
    let accountWasCreated = false
    let failedToCreateAccount = false

    async function createAccount() {

        const account = {
            username,
            password
        }

        try {
            const response = await fetch("http://localhost:8080/accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(account),
            })

            switch(response.status){

                case 201:
                    accountWasCreated = true
                    failedToCreateAccount = false
                    account.username = ""
                    account.password = ""
                break;

                case 500:
                    errorCodes = await response.json()
                    failedToCreateAccount = true
                    console.log("KAKAA")
                    console.log(errorCodes)
                break;

                case 409:
                    errorCodes = await response.json()
                    failedToCreateAccount = true
                break;

                case 400:
                    errorCodes = await response.json()
                    failedToCreateAccount = true
                    console.log("KAKAA")
                    console.log(errorCodes.length)
                    console.log(errorCodes)
                    
                break;

            }

        } catch(error) {
            failedToCreateAccount = true
            errorCodes.push("COMMUNICATION_ERROR")
        }
    }

</script>
<div class="container">
    
<div class="account">

    {#if accountWasCreated}
        <p>Account Created</p>
    {:else}
        
        <!--This is the code from tailwind-->
        <div class="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="w-full max-w-md space-y-8">
              <div>
                <img class="mx-auto h-12 w-auto" src="../public/donut.jpg" alt="Your Company">
                <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Create a new account</h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Or 
                    <Link to="/recipes" class="links">browse our delicious recipes recipes!</Link>
                </p>
              </div>
              <form class="mt-8 space-y-6" on:submit|preventDefault={createAccount}>
                <input type="hidden" name="remember" value="true">
                <div class="-space-y-px rounded-md shadow-sm">
                  <div>
                    <label for="username" class="sr-only">Username: </label>
                    <input type="text" bind:value={username} required class="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Username">
                  </div>
                  <div>
                    <label for="password" class="sr-only">Password</label>
                    <input type="password" bind:value={password} required class="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Password">
                  </div>
                </div>
          
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                    <label for="remember-me" class="ml-2 block text-sm text-gray-900">Remember me</label>
                  </div>
                </div>
          
                <div>
                  <button type="submit" class="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                      </svg>
                    </span>
                    Create New Account
                  </button>
                </div>
              </form>
            </div>
          </div>


    {/if}
    {#if failedToCreateAccount}
    <ul>
        {#each errorCodes as errorCode}
            <li>{errorCode}</li>
        {/each}
    </ul>
    {/if}
    
</div>


</div>

<style>
    .account {
        margin-left: 250px;
        color: black;
    }
</style>
