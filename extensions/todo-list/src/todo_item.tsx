import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { editingAtom, newTodoTextAtom, searchModeAtom, TodoItem, TodoSections } from "./atoms";
import { useAtom } from "jotai";
import { SECTIONS_DATA, priorityDescriptions, priorityIcons } from "./config";
import _ from "lodash";
import DeleteAllAction from "./delete_all";
import SearchModeAction from "./search_mode_action";
import OpenUrlAction from "./open_url_action";
import ListActions from "./list_actions";
import { useMemo } from "react";
import urlRegexSafe from "url-regex-safe";
import { useTodo } from "./hooks/useTodo";
import MarkAllIncompleteAction from "./mark_all_incomplete";

const SingleTodoItem = ({ item, idx, sectionKey }: { item: TodoItem; idx: number; sectionKey: keyof TodoSections }) => {
  const { editTodo, deleteTodo, markTodo, markCompleted, pin, unPin, setPriority } = useTodo({ item, idx, sectionKey });
  const [newTodoText] = useAtom(newTodoTextAtom);
  const [editing] = useAtom(editingAtom);
  const [searchMode, setSearchMode] = useAtom(searchModeAtom);

  const urls = useMemo(() => {
    return item.title.match(urlRegexSafe());
  }, [item.title]);

  dayjs.extend(customParseFormat);
  const datePart = dayjs(item.timeAdded).format("MMM D");
  const nowDatePart = dayjs(Date.now()).format("MMM D");
  const timePart = dayjs(item.timeAdded).format("h:mm A");
  const time = datePart === nowDatePart ? `at ${timePart}` : `on ${datePart}`;

  const accessories = useMemo(() => {
    const list: List.Item.Props["accessories"] = [];
    if (item.priority !== undefined) {
      list.push({
        tooltip: "priority: " + priorityDescriptions[item.priority],
        icon: priorityIcons[item.priority],
      });
    }
    if (SECTIONS_DATA[sectionKey].accessoryIcon) {
      const { accessoryIcon, name } = SECTIONS_DATA[sectionKey];
      list.push({ tooltip: name, icon: accessoryIcon });
    }
    return list;
  }, [item.priority]);

  return (
    <List.Item
      title={item.title}
      subtitle={`Added ${time}`}
      icon={
        item.completed
          ? { source: Icon.Checkmark, tintColor: Color.Green }
          : { source: Icon.Circle, tintColor: Color.Red }
      }
      accessories={accessories}
      actions={
        searchMode || (newTodoText.length === 0 && !editing) ? (
          <ActionPanel>
            {item.completed ? (
              <Action
                title="Mark as Uncompleted"
                icon={{ source: Icon.XMarkCircle, tintColor: Color.Red }}
                onAction={() => markTodo()}
              />
            ) : (
              <Action
                title="Mark as Completed"
                icon={{ source: Icon.Checkmark, tintColor: Color.Green }}
                onAction={() => markCompleted()}
              />
            )}
            <Action
              title="Edit Todo"
              icon={{ source: Icon.Pencil, tintColor: Color.Orange }}
              onAction={() => {
                setSearchMode(false);
                editTodo();
              }}
              shortcut={{ modifiers: ["cmd"], key: "e" }}
            />
            <Action
              title="Delete Todo"
              icon={{ source: Icon.Trash, tintColor: Color.Red }}
              onAction={() => deleteTodo()}
              shortcut={{ modifiers: ["cmd"], key: "d" }}
            />
            {sectionKey === "pinned" ? (
              <Action
                title="Unpin Todo"
                icon={{ source: Icon.Pin, tintColor: Color.Blue }}
                onAction={() => unPin()}
                shortcut={{ modifiers: ["cmd"], key: "p" }}
              />
            ) : (
              <Action
                title="Pin Todo"
                icon={{ source: Icon.Pin, tintColor: Color.Blue }}
                onAction={() => pin()}
                shortcut={{ modifiers: ["cmd"], key: "p" }}
              />
            )}
            <ActionPanel.Submenu
              title="Set Priority"
              shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
              icon={Icon.Exclamationmark}
            >
              <Action title="none" onAction={() => setPriority(undefined)} />
              <Action
                title="low"
                icon={priorityIcons[1]}
                onAction={() => setPriority(1)}
                autoFocus={item.priority === 1 ? true : false}
              />
              <Action
                title="meduim"
                icon={priorityIcons[2]}
                onAction={() => setPriority(2)}
                autoFocus={item.priority === 2 ? true : false}
              />
              <Action
                title="high"
                icon={priorityIcons[3]}
                onAction={() => setPriority(3)}
                autoFocus={item.priority === 3 ? true : false}
              />
            </ActionPanel.Submenu>
            {urls &&
              urls.length > 0 &&
              (urls.length === 1 ? (
                <OpenUrlAction
                  url={urls[0]}
                  title={`Open ${urls[0]}`}
                  shortcut={{
                    modifiers: ["cmd"],
                    key: "o",
                  }}
                />
              ) : (
                <ActionPanel.Submenu
                  title="Open URL"
                  shortcut={{
                    modifiers: ["cmd"],
                    key: "o",
                  }}
                  icon={Icon.Globe}
                >
                  {urls.map((url, idx) => (
                    <OpenUrlAction key={idx} url={url} />
                  ))}
                </ActionPanel.Submenu>
              ))}
            <DeleteAllAction />
            <MarkAllIncompleteAction />
            <SearchModeAction />
          </ActionPanel>
        ) : (
          <ListActions />
        )
      }
    />
  );
};
export default SingleTodoItem;
