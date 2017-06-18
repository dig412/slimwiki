<?php
use League\Flysystem\Plugin\AbstractPlugin;

class ListTree extends AbstractPlugin
{
    private $tree;

    /**
     * Get the method name.
     *
     * @return string
     */
    public function getMethod()
    {
        return 'listTree';
    }

    /**
     * List all files in the directory.
     *
     * @param string $directory
     * @param bool   $recursive
     *
     * @return array
     */
    public function handle($directory = '')
    {
        $contents = $this->filesystem->listContents($directory, $recursive = true);

        $files = array_filter($contents, function($entry) {
            return $entry["type"] == "file";
        });

        return $this->tree($files);
    }

    private function tree($files)
    {
        $tree = [];
        foreach($files as $entry) {

            //Create a pointer to the current start of the tree
            $leaf = &$tree;
            //Iterate over each part of the path the the entry
            foreach(explode('/', $entry["path"]) as $step) {

                //If the filename is the same as the part, we've got a file, so we can stop
                //iterating
                if($entry["basename"] == $step) {

                    //If we've not been here before, create a new array to store files
                    if(!is_array($leaf)) {
                        $leaf = [];
                    }
                    $leaf[] = ["basename" => $step, "path" => $entry["path"]];
                } else {
                    //we have a directory, so add a new entry to the Tree, and move the leaf pointer on to it
                    $leaf = &$leaf[$step];
                }
            }
        }
        return $tree;
    }

}
