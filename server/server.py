import asyncio
from websockets.server import serve
import json
import time

host = '127.0.0.1'
port = 5001
process_index = 0

processes = []
coroutines = []

async def stream_output(stream, eindex, websocket):
    while True:
        line = await stream.readline()
        if not line:
            break
        await websocket.send(json.dumps({
            "type": "textstream",
            "eindex": eindex,
            "text": line.decode()
        }))

async def send_complete_response(websocket, eindex):
    await websocket.send(json.dumps({
        "type": "processcomplete",
        "eindex": eindex
    }))

async def start_process(executable, flags, eindex, websocket):
    global process_index
    # Start the process
    print(f'EXE: {executable}, FLAGS: {flags}')
    process = await asyncio.create_subprocess_exec(
        executable, *flags,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    processes.append(process)

    await websocket.send(json.dumps({
        "type": "init",
        "pindex": process_index,
        "eindex": eindex
    }))
    process_index = process_index + 1

    print("Running")

    await asyncio.gather(
        stream_output(process.stdout, eindex, websocket),
        stream_output(process.stderr, eindex, websocket)
    )
    
    code = await process.wait()
    await send_complete_response(websocket, eindex)
    #await websocket.send(f"[process exited with code {code}]")
    print("Done!")

async def stop_process(index):
    print(f"Index: {index}")
    if index >= 0 and index < len(processes):
        print(f"Attempting to kill process {index}")
        process = processes[index]
        print(f"Process is {process}")
        process.kill()
        await process.wait()
        return True
    return False

async def handle_payload(payload, websocket):
    print(payload)
    type = payload.get("type")
    if type == "start":
        co = asyncio.create_task(start_process(
            payload.get("executable"),
            payload.get("flags"),
            payload.get("eindex"),
            websocket
        ))
        coroutines.append(co)
    if type == "stop":
        index = payload.get("pindex")
        eindex = payload.get("eindex")
        if await stop_process(index):
            await send_complete_response(websocket, eindex)

async def handle_client(websocket):
    async for message in websocket:
        print(f'MESSAGE: {message}')
        obj = json.loads(message)
        await handle_payload(obj, websocket)

async def main():
    async with serve(handle_client, host, port):
        print(f'WebSocket server running at ws://{host}:{port}')
        await asyncio.gather(*coroutines)
        await asyncio.Future()  # Run forever

asyncio.run(main())
